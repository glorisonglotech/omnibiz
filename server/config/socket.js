const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Customer = require('../models/customer');
const { WebRTCSignaling } = require('../services/webrtcSignaling');

let io;
let webrtcSignaling;

// Allowed origins for Socket.IO (must match server.js CORS origins)
const allowedOrigins = [
  'http://localhost:5173',              // Vite dev server (dashboard)
  'http://localhost:5174',              // Vite dev server (storefront)
  'http://localhost:5175',              // Alternative dev port
  'https://ominbiz-business-solution.netlify.app', // Hosted client storefront
  'https://omnibiz.onrender.com',       // Render hosted backend
  process.env.CLIENT_URL,               // Dynamic client URL from env
  process.env.FRONTEND_URL              // Alternative env variable
].filter(Boolean); // Remove undefined values

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });
  
  console.log('🔌 Socket.IO initialized with allowed origins:');
  allowedOrigins.forEach(origin => console.log(`  ✓ ${origin}`));

  // Authentication middleware for Socket.IO (supports both User and Customer)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if it's a customer token or user token
      if (decoded.type === 'customer') {
        const customer = await Customer.findById(decoded.id).select('-password');
        
        if (!customer || !customer.isActive) {
          return next(new Error('Authentication error: Customer not found or inactive'));
        }

        socket.userId = customer._id.toString();
        socket.userRole = 'customer';
        socket.userType = 'customer';
        socket.user = customer;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userType = 'user';
        socket.user = user;
      }
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Initialize WebRTC signaling
  webrtcSignaling = new WebRTCSignaling(io);

  // Import StorefrontPolling service
  const storefrontPolling = require('../services/storefrontPolling');

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.role})`);
    
    // Initialize WebRTC handlers for this socket
    webrtcSignaling.initializeHandlers(socket);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle storefront room joining
    socket.on('join_storefront', (inviteCode) => {
      storefrontPolling.joinStorefront(socket, inviteCode);
    });

    // Handle storefront room leaving
    socket.on('leave_storefront', (inviteCode) => {
      storefrontPolling.leaveStorefront(socket, inviteCode);
    });
    
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

    // Maps and Locations real-time handlers
    socket.on('join_maps', ({ userId }) => {
      socket.join('maps_room');
      console.log(`User ${userId} joined maps room`);
      
      // Send current active deliveries count
      socket.emit('maps_joined', {
        message: 'Connected to real-time maps updates',
        timestamp: new Date()
      });
    });

    socket.on('leave_maps', ({ userId }) => {
      socket.leave('maps_room');
      console.log(`User ${userId} left maps room`);
    });

    // Handle support chat
    socket.on('join_support_chat', ({ userId, userName }) => {
      socket.join('support_chat');
      console.log(`${userName} joined support chat`);
      
      // Notify support agents
      socket.to('admins').emit('client_joined_support', {
        userId,
        userName,
        timestamp: new Date()
      });
    });

    // Messaging handlers
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.email} joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user.email} left conversation: ${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, message, senderId, senderName }) => {
      const Message = require('../models/Message');
      const Conversation = require('../models/Conversation');

      try {
        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('message_error', { error: 'Conversation not found' });
          return;
        }

        const isBusinessOwner = conversation.businessOwnerId.toString() === socket.userId;
        const isCustomer = conversation.customerId.toString() === socket.userId;

        if (!isBusinessOwner && !isCustomer) {
          socket.emit('message_error', { error: 'Unauthorized' });
          return;
        }

        // Create message in database
        const newMessage = new Message({
          conversationId,
          senderId: socket.userId,
          senderModel: isBusinessOwner ? 'User' : 'Customer',
          senderName: socket.user.name,
          senderRole: isBusinessOwner ? 'business_owner' : 'customer',
          content: message,
          status: 'sent'
        });

        await newMessage.save();

        // Update conversation
        conversation.lastMessage = {
          content: message,
          senderId: socket.userId,
          timestamp: new Date()
        };

        // Increment unread count
        if (isBusinessOwner) {
          conversation.unreadCount.customer += 1;
        } else {
          conversation.unreadCount.businessOwner += 1;
        }

        conversation.updatedAt = new Date();
        await conversation.save();

        const messageData = {
          id: newMessage._id,
          conversationId,
          senderId: socket.userId,
          senderName: socket.user.name,
          content: message,
          timestamp: newMessage.createdAt,
          status: 'delivered'
        };
        
        // Send to sender (confirmation)
        socket.emit('message_sent', messageData);
        
        // Broadcast to conversation participants
        socket.to(`conversation_${conversationId}`).emit('message_received', messageData);

        // Notify recipient's personal room
        const recipientId = isBusinessOwner ? conversation.customerId : conversation.businessOwnerId;
        socket.to(`user_${recipientId}`).emit('new_message_notification', {
          conversationId,
          from: socket.user.name,
          preview: message.substring(0, 50)
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle admin notification from makeAdmin script
    socket.on('admin_notification', ({ userId, notification }) => {
      console.log(`📡 Sending admin notification to user: ${userId}`);
      io.to(`user_${userId}`).emit('notification', notification);
      io.to(`user_${userId}`).emit('role_updated', {
        newRole: 'super_admin',
        timestamp: new Date()
      });
    });

    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    // Purchasing room handlers
    socket.on('join_purchasing', ({ userId }) => {
      socket.join('purchasing_room');
      console.log(`User ${userId} joined purchasing room`);
    });

    socket.on('leave_purchasing', ({ userId }) => {
      socket.leave('purchasing_room');
      console.log(`User ${userId} left purchasing room`);
    });

    // Order creation event from checkout
    socket.on('order_created', ({ orderNumber, userId, total }) => {
      console.log(`Order ${orderNumber} created by user ${userId}`);
      
      // Notify admins
      socket.to('admins').emit('new_order', {
        orderNumber,
        userId,
        total,
        timestamp: new Date()
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
