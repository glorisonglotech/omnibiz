const mongoose = require('mongoose');
const crypto = require('crypto');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'co-host', 'participant', 'guest'],
    default: 'participant'
  },
  joinedAt: Date,
  leftAt: Date,
  duration: Number, // in seconds
  status: {
    type: String,
    enum: ['invited', 'joined', 'left', 'removed'],
    default: 'invited'
  }
});

const liveSessionSchema = new mongoose.Schema({
  // Session identification
  sessionId: {
    type: String,
    unique: true,
    required: function() {
      return this.isNew; // Only required for new documents
    }
  },
  accessLink: {
    type: String,
    unique: true,
    required: function() {
      return this.isNew; // Only required for new documents
    }
  },
  
  // Session details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  sessionType: {
    type: String,
    enum: ['support_call', 'webinar', 'training', 'consultation', 'demo', 'meeting'],
    default: 'meeting'
  },
  
  // Organizer
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Scheduling
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Participants
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 100
  },
  
  // Access control
  requiresApproval: {
    type: Boolean,
    default: false
  },
  password: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  allowedDomains: [String],
  
  // Session settings
  enableChat: {
    type: Boolean,
    default: true
  },
  enableScreenShare: {
    type: Boolean,
    default: true
  },
  enableRecording: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  recordingStartedAt: Date,
  recordingEndedAt: Date,
  
  // Waiting room
  waitingRoomEnabled: {
    type: Boolean,
    default: false
  },
  waitingParticipants: [{
    email: String,
    name: String,
    joinedWaitingRoomAt: Date
  }],
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  
  // WebRTC Room
  webrtcRoomId: String,
  
  // Related entities
  relatedTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket'
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Metadata
  tags: [String],
  agenda: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: Date
  }],
  
  // Email notifications
  emailsSent: [{
    type: {
      type: String,
      enum: ['invite', 'reminder', 'started', 'ended', 'cancelled']
    },
    sentAt: Date,
    recipients: [String]
  }],
  sendReminders: {
    type: Boolean,
    default: true
  },
  reminderMinutesBefore: [Number], // e.g., [60, 15] for 1 hour and 15 min before
  
  // Analytics
  peakParticipants: {
    type: Number,
    default: 0
  },
  totalDuration: Number, // in seconds
  chatMessageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique session ID and access link before saving
liveSessionSchema.pre('save', function(next) {
  const generateSessionId = () => `SES-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const generateAccessLink = () => crypto.randomBytes(16).toString('hex');
  
  if (this.isNew) {
    // Only generate these for new documents
    this.sessionId = this.sessionId || generateSessionId();
    this.accessLink = this.accessLink || generateAccessLink();
    this.webrtcRoomId = this.webrtcRoomId || `room_${this.sessionId}_${Date.now()}`;
  }
  
  next();
});

// Generate full access URL
liveSessionSchema.methods.getFullAccessUrl = function(baseUrl) {
  return `${baseUrl}/session/join/${this.accessLink}`;
};

// Check if session is active
liveSessionSchema.methods.isActive = function() {
  return this.status === 'live';
};

// Check if session can start
liveSessionSchema.methods.canStart = function() {
  const now = new Date();
  const scheduledStart = new Date(this.scheduledStartTime);
  // Allow starting 15 minutes before scheduled time
  const earlyStartTime = new Date(scheduledStart.getTime() - 15 * 60 * 1000);
  
  return now >= earlyStartTime && this.status === 'scheduled';
};

// Add participant
liveSessionSchema.methods.addParticipant = function(userData) {
  const existingParticipant = this.participants.find(p => p.email === userData.email);
  
  if (existingParticipant) {
    existingParticipant.joinedAt = new Date();
    existingParticipant.status = 'joined';
  } else {
    this.participants.push({
      ...userData,
      joinedAt: new Date(),
      status: 'joined'
    });
  }
  
  // Update peak participants
  const currentParticipants = this.participants.filter(p => p.status === 'joined').length;
  if (currentParticipants > this.peakParticipants) {
    this.peakParticipants = currentParticipants;
  }
  
  return this.save();
};

// Remove participant
liveSessionSchema.methods.removeParticipant = function(email) {
  const participant = this.participants.find(p => p.email === email);
  
  if (participant) {
    participant.leftAt = new Date();
    participant.status = 'left';
    
    if (participant.joinedAt) {
      participant.duration = Math.floor((participant.leftAt - participant.joinedAt) / 1000);
    }
  }
  
  return this.save();
};

// Indexes for efficient querying
liveSessionSchema.index({ sessionId: 1 });
liveSessionSchema.index({ accessLink: 1 });
liveSessionSchema.index({ host: 1, scheduledStartTime: -1 });
liveSessionSchema.index({ status: 1, scheduledStartTime: 1 });
liveSessionSchema.index({ 'participants.email': 1 });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
