import { io } from 'socket.io-client';

/**
 * WebRTC Service for Video/Audio Calls
 */
class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStreams = new Map();
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.onRemoteStreamCallback = null;
    this.onRemoteStreamRemovedCallback = null;
    this.onCallEndedCallback = null;

    // WebRTC Configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initialize socket connection for WebRTC signaling
   */
  initializeSocket(token) {
    if (this.socket) return;

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: { token },
      autoConnect: true
    });

    this.setupSocketListeners();
  }

  /**
   * Setup Socket.IO event listeners
   */
  setupSocketListeners() {
    // Room joined successfully
    this.socket.on('webrtc:joined-room', (data) => {
      console.log('✅ Joined room:', data);
      
      // Create offers for existing participants
      data.participants.forEach(participant => {
        this.createOffer(participant.socketId);
      });
    });

    // New user joined
    this.socket.on('webrtc:user-joined', (data) => {
      console.log('👤 User joined:', data);
    });

    // Receive offer
    this.socket.on('webrtc:offer', async (data) => {
      console.log('📨 Received offer from:', data.from);
      await this.handleOffer(data.from, data.offer);
    });

    // Receive answer
    this.socket.on('webrtc:answer', async (data) => {
      console.log('📨 Received answer from:', data.from);
      await this.handleAnswer(data.from, data.answer);
    });

    // Receive ICE candidate
    this.socket.on('webrtc:ice-candidate', async (data) => {
      if (data.candidate) {
        const peerConnection = this.getPeerConnection(data.from);
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      }
    });

    // User left
    this.socket.on('webrtc:user-left', (data) => {
      console.log('👤 User left:', data);
      this.handleUserLeft(data.socketId);
    });

    // Call ended
    this.socket.on('webrtc:call-ended', (data) => {
      console.log('📞 Call ended by:', data.userId);
      this.handleUserLeft(data.socketId);
    });

    // Audio toggled
    this.socket.on('webrtc:audio-toggled', (data) => {
      console.log('🔊 Audio toggled:', data);
    });

    // Video toggled
    this.socket.on('webrtc:video-toggled', (data) => {
      console.log('📹 Video toggled:', data);
    });

    // Error
    this.socket.on('webrtc:error', (data) => {
      console.error('❌ WebRTC error:', data);
    });
  }

  /**
   * Start a call
   */
  async startCall(roomId, userId, userName, callType = 'video') {
    try {
      this.roomId = roomId;
      this.userId = userId;
      this.userName = userName;

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });

      console.log('✅ Local stream acquired');

      // Join room via socket
      this.socket.emit('webrtc:join-room', {
        roomId,
        userId,
        userName,
        callType
      });

      return this.localStream;
    } catch (error) {
      console.error('❌ Error starting call:', error);
      throw error;
    }
  }

  /**
   * Get or create peer connection
   */
  getPeerConnection(socketId) {
    if (!this.peerConnection) {
      this.peerConnection = new Map();
    }

    if (!this.peerConnection.has(socketId)) {
      const pc = new RTCPeerConnection(this.config);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('📥 Received remote track from:', socketId);
        
        const [remoteStream] = event.streams;
        this.remoteStreams.set(socketId, remoteStream);

        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(socketId, remoteStream);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc:ice-candidate', {
            to: socketId,
            candidate: event.candidate,
            roomId: this.roomId
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          this.handleUserLeft(socketId);
        }
      };

      this.peerConnection.set(socketId, pc);
    }

    return this.peerConnection.get(socketId);
  }

  /**
   * Create and send offer
   */
  async createOffer(socketId) {
    try {
      const pc = this.getPeerConnection(socketId);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('webrtc:offer', {
        to: socketId,
        offer: pc.localDescription,
        roomId: this.roomId
      });

      console.log('📤 Sent offer to:', socketId);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(socketId, offer) {
    try {
      const pc = this.getPeerConnection(socketId);
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.socket.emit('webrtc:answer', {
        to: socketId,
        answer: pc.localDescription,
        roomId: this.roomId
      });

      console.log('📤 Sent answer to:', socketId);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(socketId, answer) {
    try {
      const pc = this.getPeerConnection(socketId);
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  /**
   * Handle user leaving
   */
  handleUserLeft(socketId) {
    // Close peer connection
    if (this.peerConnection && this.peerConnection.has(socketId)) {
      this.peerConnection.get(socketId).close();
      this.peerConnection.delete(socketId);
    }

    // Remove remote stream
    if (this.remoteStreams.has(socketId)) {
      this.remoteStreams.delete(socketId);
      
      if (this.onRemoteStreamRemovedCallback) {
        this.onRemoteStreamRemovedCallback(socketId);
      }
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });

      this.socket.emit('webrtc:toggle-audio', {
        enabled,
        roomId: this.roomId
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });

      this.socket.emit('webrtc:toggle-video', {
        enabled,
        roomId: this.roomId
      });
    }
  }

  /**
   * End call
   */
  endCall() {
    // Emit end call event
    if (this.socket) {
      this.socket.emit('webrtc:end-call', {
        roomId: this.roomId
      });
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    if (this.peerConnection) {
      this.peerConnection.forEach(pc => pc.close());
      this.peerConnection.clear();
    }

    // Clear remote streams
    this.remoteStreams.clear();

    // Leave room
    if (this.socket && this.roomId) {
      this.socket.emit('webrtc:leave-room', {
        roomId: this.roomId
      });
    }

    if (this.onCallEndedCallback) {
      this.onCallEndedCallback();
    }

    console.log('📞 Call ended');
  }

  /**
   * Set callback for when remote stream is received
   */
  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for when remote stream is removed
   */
  onRemoteStreamRemoved(callback) {
    this.onRemoteStreamRemovedCallback = callback;
  }

  /**
   * Set callback for when call ends
   */
  onCallEnded(callback) {
    this.onCallEndedCallback = callback;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;
