const SupportTicket = require('../models/supportTicket');
const FAQ = require('../models/faq');
const User = require('../models/user');
const { getIO } = require('../config/socket');
const { notificationService } = require('../services/notificationService');

// @desc    Get all support tickets for a user
// @route   GET /api/support/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, priority, limit = 50 } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email avatar')
      .populate('assignedAgent', 'name email avatar role')
      .populate('messages.sender', 'name avatar')
      .sort({ lastActivityAt: -1 })
      .limit(parseInt(limit));

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, tags } = req.body;
    const userId = req.user._id;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticket = new SupportTicket({
      userId,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      tags: tags || [],
      status: 'open'
    });

    await ticket.save();

    // Populate user data
    await ticket.populate('userId', 'name email avatar');

    // Emit Socket.IO event to notify support agents
    try {
      const io = getIO();
      io.to('admins').emit('new_support_ticket', {
        ticket,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    // Notify admins via email
    try {
      const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
      for (const admin of admins) {
        await notificationService.sendCustomNotification({
          user: admin,
          title: 'New Support Ticket',
          message: `${req.user.name} created a new support ticket: ${subject}`,
          includeEmail: true,
          includeSMS: false
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'name email avatar')
      .populate('assignedAgent', 'name email avatar role')
      .populate('messages.sender', 'name avatar');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permission (user can only view their own tickets, admins can view all)
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && ticket.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add a message to a ticket
// @route   POST /api/support/tickets/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permission
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && ticket.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newMessage = {
      sender: userId,
      senderType: isAdmin ? 'agent' : 'user',
      message,
      attachments: attachments || [],
      createdAt: new Date()
    };

    ticket.messages.push(newMessage);
    ticket.lastActivityAt = new Date();

    // Update status if agent replied
    if (isAdmin && ticket.status === 'waiting_response') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    // Populate the new message sender
    await ticket.populate('messages.sender', 'name avatar');
    const populatedMessage = ticket.messages[ticket.messages.length - 1];

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      
      // Notify the other party
      if (isAdmin) {
        io.to(`user_${ticket.userId}`).emit('support_message_received', {
          ticketId: ticket._id,
          message: populatedMessage
        });
      } else {
        io.to('admins').emit('support_message_received', {
          ticketId: ticket._id,
          message: populatedMessage
        });
      }
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    // Send notification
    try {
      const recipient = isAdmin 
        ? await User.findById(ticket.userId)
        : await User.findById(ticket.assignedAgent);

      if (recipient) {
        await notificationService.sendCustomNotification({
          user: recipient,
          title: `New Message on Ticket #${ticket.ticketNumber}`,
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          includeEmail: true,
          includeSMS: false
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.json(populatedMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/tickets/:id/status
// @access  Private (Admin only)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.status = status;
    ticket.lastActivityAt = new Date();

    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    // Emit Socket.IO event
    try {
      const io = getIO();
      io.to(`user_${ticket.userId}`).emit('ticket_status_updated', {
        ticketId: ticket._id,
        status,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Assign ticket to agent
// @route   PUT /api/support/tickets/:id/assign
// @access  Private (Admin only)
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.assignedAgent = agentId;
    ticket.status = 'in_progress';
    ticket.lastActivityAt = new Date();

    await ticket.save();
    await ticket.populate('assignedAgent', 'name email avatar role');

    // Emit Socket.IO event
    try {
      const io = getIO();
      io.to(`user_${agentId}`).emit('ticket_assigned', {
        ticket,
        timestamp: new Date()
      });
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all FAQs
// @route   GET /api/support/faqs
// @access  Public
exports.getFAQs = async (req, res) => {
  try {
    const { category, search, limit = 100 } = req.query;

    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    let faqs;

    if (search) {
      // Text search
      faqs = await FAQ.find({
        ...query,
        $text: { $search: search }
      })
        .sort({ order: 1, helpfulCount: -1 })
        .limit(parseInt(limit));
    } else {
      faqs = await FAQ.find(query)
        .sort({ order: 1, helpfulCount: -1 })
        .limit(parseInt(limit));
    }

    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/support/faqs
// @access  Private (Admin only)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, tags, order, isPublished } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      tags: tags || [],
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id
    });

    await faq.save();

    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update FAQ helpful count
// @route   POST /api/support/faqs/:id/helpful
// @access  Public
exports.markFAQHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    if (helpful) {
      faq.helpfulCount += 1;
    } else {
      faq.notHelpfulCount += 1;
    }

    await faq.save();

    res.json({ helpfulCount: faq.helpfulCount, notHelpfulCount: faq.notHelpfulCount });
  } catch (error) {
    console.error('Error updating FAQ helpful count:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get support agents
// @route   GET /api/support/agents
// @access  Public
exports.getSupportAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: { $in: ['admin', 'super_admin'] },
      isActive: true
    })
      .select('name email avatar role')
      .limit(20);

    res.json(agents);
  } catch (error) {
    console.error('Error fetching support agents:', error);
    res.status(500).json({ error: error.message });
  }
};
