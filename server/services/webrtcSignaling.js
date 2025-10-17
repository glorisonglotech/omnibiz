/**
 * WebRTC Signaling Service
 * Handles peer-to-peer connection signaling for video/audio calls
 */

class WebRTCSignaling {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // Store room information
    this.users = new Map(); // Store user connection info
    
    console.log('✅ WebRTC Signaling Service initialized');
  }

  /**
   * Initialize WebRTC event handlers
   */
  initializeHandlers(socket) {
    // Join a call room
    socket.on('webrtc:join-room', this.handleJoinRoom.bind(this, socket));
    
    // Leave a call room
    socket.on('webrtc:leave-room', this.handleLeaveRoom.bind(this, socket));
    
    // Send WebRTC offer
    socket.on('webrtc:offer', this.handleOffer.bind(this, socket));
    
    // Send WebRTC answer
    socket.on('webrtc:answer', this.handleAnswer.bind(this, socket));
    
    // Send ICE candidate
    socket.on('webrtc:ice-candidate', this.handleIceCandidate.bind(this, socket));
    
    // Toggle audio/video
    socket.on('webrtc:toggle-audio', this.handleToggleAudio.bind(this, socket));
    socket.on('webrtc:toggle-video', this.handleToggleVideo.bind(this, socket));
    
    // End call
    socket.on('webrtc:end-call', this.handleEndCall.bind(this, socket));
    
    // Handle disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle user joining a call room
   */
  handleJoinRoom(socket, data) {
    const { roomId, userId, userName, callType = 'video' } = data;

    if (!roomId || !userId) {
      socket.emit('webrtc:error', { message: 'Room ID and User ID are required' });
      return;
    }

    // Join the socket room
    socket.join(roomId);

    // Store user info
    this.users.set(socket.id, {
      userId,
      userName,
      roomId,
      audioEnabled: true,
      videoEnabled: callType === 'video'
    });

    // Get or create room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: [],
        createdAt: new Date(),
        callType
      });
    }

    const room = this.rooms.get(roomId);
    
    // Add participant
    room.participants.push({
      socketId: socket.id,
      userId,
      userName,
      audioEnabled: true,
      videoEnabled: callType === 'video',
      joinedAt: new Date()
    });

    console.log(`👤 User ${userName} (${userId}) joined room ${roomId}`);

    // Notify user they joined successfully
    socket.emit('webrtc:joined-room', {
      roomId,
      participants: room.participants.filter(p => p.socketId !== socket.id),
      callType
    });

    // Notify other participants
    socket.to(roomId).emit('webrtc:user-joined', {
      socketId: socket.id,
      userId,
      userName,
      audioEnabled: true,
      videoEnabled: callType === 'video'
    });
  }

  /**
   * Handle user leaving a call room
   */
  handleLeaveRoom(socket, data) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    const { roomId } = user;
    
    this.leaveRoom(socket, roomId);
  }

  /**
   * Handle WebRTC offer
   */
  handleOffer(socket, data) {
    const { to, offer, roomId } = data;

    console.log(`📤 Sending offer from ${socket.id} to ${to}`);

    socket.to(to).emit('webrtc:offer', {
      from: socket.id,
      offer,
      roomId
    });
  }

  /**
   * Handle WebRTC answer
   */
  handleAnswer(socket, data) {
    const { to, answer, roomId } = data;

    console.log(`📤 Sending answer from ${socket.id} to ${to}`);

    socket.to(to).emit('webrtc:answer', {
      from: socket.id,
      answer,
      roomId
    });
  }

  /**
   * Handle ICE candidate
   */
  handleIceCandidate(socket, data) {
    const { to, candidate, roomId } = data;

    socket.to(to).emit('webrtc:ice-candidate', {
      from: socket.id,
      candidate,
      roomId
    });
  }

  /**
   * Handle toggle audio
   */
  handleToggleAudio(socket, data) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    const { enabled } = data;
    user.audioEnabled = enabled;

    // Update room participant
    const room = this.rooms.get(user.roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.audioEnabled = enabled;
      }
    }

    // Notify other participants
    socket.to(user.roomId).emit('webrtc:audio-toggled', {
      socketId: socket.id,
      userId: user.userId,
      enabled
    });
  }

  /**
   * Handle toggle video
   */
  handleToggleVideo(socket, data) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    const { enabled } = data;
    user.videoEnabled = enabled;

    // Update room participant
    const room = this.rooms.get(user.roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.videoEnabled = enabled;
      }
    }

    // Notify other participants
    socket.to(user.roomId).emit('webrtc:video-toggled', {
      socketId: socket.id,
      userId: user.userId,
      enabled
    });
  }

  /**
   * Handle end call
   */
  handleEndCall(socket, data) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    const { roomId } = user;

    // Notify other participants
    socket.to(roomId).emit('webrtc:call-ended', {
      socketId: socket.id,
      userId: user.userId
    });

    this.leaveRoom(socket, roomId);
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnect(socket) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    console.log(`👤 User ${user.userName} disconnected from room ${user.roomId}`);

    // Notify other participants
    socket.to(user.roomId).emit('webrtc:user-left', {
      socketId: socket.id,
      userId: user.userId
    });

    this.leaveRoom(socket, user.roomId);
  }

  /**
   * Leave room (internal method)
   */
  leaveRoom(socket, roomId) {
    const user = this.users.get(socket.id);
    
    if (!user) return;

    // Leave socket room
    socket.leave(roomId);

    // Remove user from room
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);

      // Delete room if empty
      if (room.participants.length === 0) {
        this.rooms.delete(roomId);
        console.log(`🗑️  Room ${roomId} deleted (empty)`);
      }
    }

    // Remove user
    this.users.delete(socket.id);
  }

  /**
   * Get room info
   */
  getRoomInfo(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get all active rooms
   */
  getActiveRooms() {
    return Array.from(this.rooms.values());
  }
}

module.exports = { WebRTCSignaling };
