const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { WebRTCSignaling } = require('../services/webrtcSignaling');

let io;
let webrtcSignaling;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5175",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Initialize WebRTC signaling
  webrtcSignaling = new WebRTCSignaling(io);

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.role})`);
    
    // Initialize WebRTC handlers for this socket
    webrtcSignaling.initializeHandlers(socket);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join role-based rooms
    socket.join(`role_${socket.userRole}`);
    
    // If admin, join admin room
    if (['admin', 'super_admin'].includes(socket.userRole)) {
      socket.join('admins');
    }
    
    // If client, join clients room
    if (socket.userRole === 'client') {
      socket.join('clients');
      
      // Join assigned admin's room if they have one
      if (socket.user.assignedAdmin) {
        socket.join(`admin_${socket.user.assignedAdmin}`);
      }
    }

    // Handle joining specific rooms
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`User ${socket.user.email} joined room: ${roomName}`);
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      console.log(`User ${socket.user.email} left room: ${roomName}`);
    });

    // Handle order updates
    socket.on('order_update', (data) => {
      // Broadcast to relevant users
      if (data.orderId && data.userId) {
        // Notify the order owner
        socket.to(`user_${data.userId}`).emit('order_updated', data);
        
        // Notify admins
        socket.to('admins').emit('order_updated', data);
      }
    });

    // Handle service request updates
    socket.on('service_request_update', (data) => {
      if (data.requestId && data.clientId) {
        // Notify the client
        socket.to(`user_${data.clientId}`).emit('service_request_updated', data);
        
        // Notify assigned admin
        if (data.assignedAdminId) {
          socket.to(`user_${data.assignedAdminId}`).emit('service_request_updated', data);
        }
        
        // Notify all admins
        socket.to('admins').emit('service_request_updated', data);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.room).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        ...data
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.room).emit('user_stopped_typing', {
        userId: socket.userId,
        ...data
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Notification helper functions
const notificationHelpers = {
  // Notify user about order updates
  notifyOrderUpdate: (userId, orderData) => {
    if (io) {
      io.to(`user_${userId}`).emit('order_updated', {
        type: 'order_update',
        data: orderData,
        timestamp: new Date()
      });
      
      // Also notify admins
      io.to('admins').emit('order_updated', {
        type: 'order_update',
        data: orderData,
        timestamp: new Date()
      });
    }
  },

  // Notify about service request updates
  notifyServiceRequestUpdate: (clientId, assignedAdminId, requestData) => {
    if (io) {
      // Notify client
      io.to(`user_${clientId}`).emit('service_request_updated', {
        type: 'service_request_update',
        data: requestData,
        timestamp: new Date()
      });
      
      // Notify assigned admin
      if (assignedAdminId) {
        io.to(`user_${assignedAdminId}`).emit('service_request_updated', {
          type: 'service_request_update',
          data: requestData,
          timestamp: new Date()
        });
      }
      
      // Notify all admins
      io.to('admins').emit('service_request_updated', {
        type: 'service_request_update',
        data: requestData,
        timestamp: new Date()
      });
    }
  },

  // Notify about new orders (for admins)
  notifyNewOrder: (orderData) => {
    if (io) {
      io.to('admins').emit('new_order', {
        type: 'new_order',
        data: orderData,
        timestamp: new Date()
      });
    }
  },

  // Notify about new service requests (for admins)
  notifyNewServiceRequest: (requestData) => {
    if (io) {
      io.to('admins').emit('new_service_request', {
        type: 'new_service_request',
        data: requestData,
        timestamp: new Date()
      });
      
      // Notify assigned admin specifically
      if (requestData.assignedAdminId) {
        io.to(`user_${requestData.assignedAdminId}`).emit('new_service_request', {
          type: 'new_service_request',
          data: requestData,
          timestamp: new Date()
        });
      }
    }
  },

  // Send general notification to user
  notifyUser: (userId, notification) => {
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    }
  },

  // Send notification to role
  notifyRole: (role, notification) => {
    if (io) {
      io.to(`role_${role}`).emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    }
  },

  // Send notification to all admins
  notifyAdmins: (notification) => {
    if (io) {
      io.to('admins').emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    }
  },

  // Send notification to all clients
  notifyClients: (notification) => {
    if (io) {
      io.to('clients').emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    }
  }
};

module.exports = {
  initializeSocket,
  getIO,
  notificationHelpers,
  getWebRTCSignaling: () => webrtcSignaling
};
