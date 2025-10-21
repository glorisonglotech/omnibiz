const LiveSession = require('../models/liveSession');
const User = require('../models/user');
const { getIO } = require('../config/socket');
const { emailService } = require('../config/email');

// @desc    Create a new live session
// @route   POST /api/sessions
// @access  Private
exports.createSession = async (req, res) => {
  try {
    const {
      title,
      description,
      sessionType,
      scheduledStartTime,
      scheduledEndTime,
      participants,
      maxParticipants,
      requiresApproval,
      enableRecording,
      agenda,
      tags
    } = req.body;

    if (!title || !scheduledStartTime || !scheduledEndTime) {
      return res.status(400).json({ error: 'Title and schedule times are required' });
    }

    const session = new LiveSession({
      title,
      description,
      sessionType: sessionType || 'meeting',
      host: req.user._id,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      maxParticipants: maxParticipants || 100,
      requiresApproval: requiresApproval || false,
      enableRecording: enableRecording || false,
      agenda,
      tags: tags || []
    });

    // Add initial participants
    if (participants && Array.isArray(participants)) {
      session.participants = participants.map(p => ({
        email: p.email,
        name: p.name,
        role: p.role || 'participant',
        status: 'invited'
      }));
    }

    await session.save();
    await session.populate('host', 'name email avatar');

    // Send invitation emails
    if (session.participants.length > 0) {
      await sendSessionInvites(session);
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all sessions for a user
// @route   GET /api/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const { status, type, upcoming } = req.query;
    const userId = req.user._id;

    const query = {
      $or: [
        { host: userId },
        { 'participants.user': userId },
        { 'participants.email': req.user.email }
      ]
    };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.sessionType = type;
    }
    if (upcoming === 'true') {
      query.scheduledStartTime = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'live'] };
    }

    const sessions = await LiveSession.find(query)
      .populate('host', 'name email avatar')
      .sort({ scheduledStartTime: -1 })
      .limit(50);

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get session by access link
// @route   GET /api/sessions/join/:accessLink
// @access  Public
exports.getSessionByLink = async (req, res) => {
  try {
    const { accessLink } = req.params;

    const session = await LiveSession.findOne({ accessLink })
      .populate('host', 'name email avatar');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Return limited info for security
    res.json({
      sessionId: session.sessionId,
      title: session.title,
      description: session.description,
      sessionType: session.sessionType,
      host: session.host,
      scheduledStartTime: session.scheduledStartTime,
      scheduledEndTime: session.scheduledEndTime,
      status: session.status,
      requiresApproval: session.requiresApproval,
      maxParticipants: session.maxParticipants,
      currentParticipants: session.participants.filter(p => p.status === 'joined').length,
      waitingRoomEnabled: session.waitingRoomEnabled
    });
  } catch (error) {
    console.error('Get session by link error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Start a session
// @route   POST /api/sessions/:id/start
// @access  Private (Host only)
exports.startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can start the session' });
    }

    if (!session.canStart()) {
      return res.status(400).json({ error: 'Session cannot be started yet' });
    }

    session.status = 'live';
    session.actualStartTime = new Date();
    await session.save();

    // Notify all participants
    const io = getIO();
    session.participants.forEach(p => {
      if (p.user) {
        io.to(`user_${p.user}`).emit('session_started', {
          sessionId: session.sessionId,
          title: session.title,
          accessLink: session.accessLink
        });
      }
    });

    // Send emails to participants
    await sendSessionStartedEmails(session);

    res.json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Join a session
// @route   POST /api/sessions/:accessLink/join
// @access  Public
exports.joinSession = async (req, res) => {
  try {
    const { accessLink } = req.params;
    const { email, name, password } = req.body;

    const session = await LiveSession.findOne({ accessLink });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check password if required
    if (session.password && session.password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    // Check max participants
    const activeParticipants = session.participants.filter(p => p.status === 'joined').length;
    if (activeParticipants >= session.maxParticipants) {
      return res.status(403).json({ error: 'Session is full' });
    }

    // Check if requires approval
    if (session.requiresApproval || session.waitingRoomEnabled) {
      session.waitingParticipants.push({
        email,
        name,
        joinedWaitingRoomAt: new Date()
      });
      await session.save();

      // Notify host
      const io = getIO();
      io.to(`user_${session.host}`).emit('participant_waiting', {
        sessionId: session.sessionId,
        participant: { email, name }
      });

      return res.json({
        status: 'waiting',
        message: 'Please wait for the host to admit you'
      });
    }

    // Add participant directly
    await session.addParticipant({
      email,
      name,
      user: req.user?._id,
      role: 'participant'
    });

    res.json({
      status: 'joined',
      session: {
        sessionId: session.sessionId,
        webrtcRoomId: session.webrtcRoomId,
        title: session.title,
        enableChat: session.enableChat,
        enableScreenShare: session.enableScreenShare
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    End a session
// @route   POST /api/sessions/:id/end
// @access  Private (Host only)
exports.endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can end the session' });
    }

    session.status = 'ended';
    session.actualEndTime = new Date();
    
    if (session.actualStartTime) {
      session.totalDuration = Math.floor((session.actualEndTime - session.actualStartTime) / 1000);
    }

    await session.save();

    // Notify all participants
    const io = getIO();
    io.to(session.webrtcRoomId).emit('session_ended', {
      sessionId: session.sessionId,
      endedAt: session.actualEndTime
    });

    res.json(session);
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper: Send session invite emails
async function sendSessionInvites(session) {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5175';
    const accessUrl = session.getFullAccessUrl(baseUrl);

    for (const participant of session.participants) {
      await emailService.sendEmail({
        to: participant.email,
        subject: `Invitation: ${session.title}`,
        html: `
          <h2>You're invited to a ${session.sessionType}</h2>
          <p><strong>Title:</strong> ${session.title}</p>
          <p><strong>When:</strong> ${new Date(session.scheduledStartTime).toLocaleString()}</p>
          <p><strong>Duration:</strong> ${Math.round((new Date(session.scheduledEndTime) - new Date(session.scheduledStartTime)) / 60000)} minutes</p>
          ${session.description ? `<p><strong>Description:</strong> ${session.description}</p>` : ''}
          <p><a href="${accessUrl}" style="display:inline-block;padding:10px 20px;background:#0066cc;color:white;text-decoration:none;border-radius:5px;">Join Session</a></p>
          <p>Or copy this link: ${accessUrl}</p>
        `
      });
    }

    session.emailsSent.push({
      type: 'invite',
      sentAt: new Date(),
      recipients: session.participants.map(p => p.email)
    });

    await session.save();
  } catch (error) {
    console.error('Send invites error:', error);
  }
}

// Helper: Send session started emails
async function sendSessionStartedEmails(session) {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5175';
    const accessUrl = session.getFullAccessUrl(baseUrl);

    for (const participant of session.participants) {
      if (participant.status !== 'joined') {
        await emailService.sendEmail({
          to: participant.email,
          subject: `${session.title} has started`,
          html: `
            <h2>The session "${session.title}" has started!</h2>
            <p>Join now: <a href="${accessUrl}">${accessUrl}</a></p>
          `
        });
      }
    }
  } catch (error) {
    console.error('Send started emails error:', error);
  }
}

// Functions already exported via exports.functionName above
// No need for additional module.exports
