const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Customer = require('../models/customer');
const User = require('../models/user');

// @desc    Get all conversations for business owner
// @route   GET /api/messages/conversations
// @access  Private (Business Owner)
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'client') {
      // Business owners see their conversations with customers
      query = { businessOwnerId: userId, status: { $ne: 'archived' } };
    } else {
      // Customers see their conversations with business owners
      query = { customerId: userId, status: { $ne: 'archived' } };
    }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(100);

    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id,
        name: userRole === 'customer' ? conv.businessOwnerName : conv.customerName,
        email: userRole === 'customer' ? null : conv.customerEmail,
        phone: userRole === 'customer' ? null : conv.customerPhone,
        avatar: '',
        lastMessage: conv.lastMessage?.content || '',
        lastMessageTime: conv.lastMessage?.timestamp || conv.updatedAt,
        unreadCount: userRole === 'customer' ? conv.unreadCount.customer : conv.unreadCount.businessOwner,
        isOnline: false, // Will be handled by Socket.IO
        type: 'direct',
        priority: conv.priority,
        tags: conv.tags
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations',
      error: error.message 
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private (Participants only)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    // Security: Only allow participants to access messages
    const isParticipant = 
      conversation.businessOwnerId.toString() === userId.toString() ||
      conversation.customerId.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: You are not a participant in this conversation' 
      });
    }

    const messages = await Message.find({ 
      conversationId,
      isDeleted: false 
    })
      .sort({ createdAt: 1 })
      .limit(500);

    // Mark messages as read
    await markMessagesAsRead(conversationId, userId);

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg._id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        attachments: msg.attachments,
        timestamp: msg.createdAt,
        status: msg.status
      }))
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content is required' 
      });
    }

    // Verify conversation and user is participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    const isBusinessOwner = conversation.businessOwnerId.toString() === userId.toString();
    const isCustomer = conversation.customerId.toString() === userId.toString();

    if (!isBusinessOwner && !isCustomer) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderModel: isBusinessOwner ? 'User' : 'Customer',
      senderName: req.user.name,
      senderRole: isBusinessOwner ? 'business_owner' : 'customer',
      content: content.trim(),
      attachments: attachments || [],
      status: 'sent'
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = {
      content: content.trim(),
      senderId: userId,
      timestamp: new Date()
    };

    // Increment unread count for recipient
    if (isBusinessOwner) {
      conversation.unreadCount.customer += 1;
    } else {
      conversation.unreadCount.businessOwner += 1;
    }

    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: message.createdAt,
        status: message.status
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: error.message 
    });
  }
};

// @desc    Create or get conversation
// @route   POST /api/messages/conversations
// @access  Private (Business Owner or Customer)
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.customer ? 'customer' : 'user';
    
    let businessOwnerId, customerId, customerName, customerEmail, customerPhone, businessOwnerName;

    if (userType === 'customer') {
      // Customer is creating a conversation with their business owner
      const customer = req.customer || req.user;
      customerId = customer._id;
      customerName = customer.name;
      customerEmail = customer.email;
      customerPhone = customer.phone;
      businessOwnerId = customer.invitedBy;

      // Get business owner info
      const businessOwner = await User.findById(businessOwnerId).select('name');
      if (!businessOwner) {
        return res.status(404).json({
          success: false,
          message: 'Business owner not found'
        });
      }
      businessOwnerName = businessOwner.name;
    } else {
      // Business owner is creating a conversation with a customer
      const { customerId: reqCustomerId, customerName: reqCustomerName, 
              customerEmail: reqCustomerEmail, customerPhone: reqCustomerPhone } = req.body;
      
      businessOwnerId = userId;
      businessOwnerName = req.user.name;
      customerId = reqCustomerId;
      customerName = reqCustomerName;
      customerEmail = reqCustomerEmail;
      customerPhone = reqCustomerPhone;
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      businessOwnerId,
      customerId
    });

    if (conversation) {
      return res.json({
        success: true,
        conversation: {
          id: conversation._id,
          name: userType === 'customer' ? businessOwnerName : customerName,
          email: customerEmail,
          phone: customerPhone
        },
        isNew: false
      });
    }

    // Create new conversation
    conversation = new Conversation({
      businessOwnerId,
      customerId,
      businessOwnerName,
      customerName,
      customerEmail,
      customerPhone
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      conversation: {
        id: conversation._id,
        name: userType === 'customer' ? businessOwnerName : customerName,
        email: customerEmail,
        phone: customerPhone
      },
      isNew: true
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create conversation',
      error: error.message 
    });
  }
};

// @desc    Mark message as read
// @route   POST /api/messages/:messageId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Don't mark own messages as read
    if (message.senderId.toString() === userId.toString()) {
      return res.json({ success: true });
    }

    // Add to readBy array if not already read
    const alreadyRead = message.readBy.some(
      r => r.userId.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({ userId, readAt: new Date() });
      message.status = 'read';
      await message.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark as read',
      error: error.message 
    });
  }
};

// @desc    Get all customers for business owner
// @route   GET /api/messages/customers
// @access  Private (Business Owner)
exports.getCustomers = async (req, res) => {
  try {
    const businessOwnerId = req.user._id;

    // Get all customers who were invited by this business owner
    const customers = await Customer.find({ 
      invitedBy: businessOwnerId,
      isActive: true 
    })
      .select('name email phone totalOrders totalSpent lastLogin createdAt')
      .sort({ createdAt: -1 })
      .limit(200);

    // Get existing conversations to mark which customers have active chats
    const conversations = await Conversation.find({
      businessOwnerId,
      status: 'active'
    }).select('customerId unreadCount');

    const conversationMap = {};
    conversations.forEach(conv => {
      conversationMap[conv.customerId.toString()] = {
        conversationId: conv._id,
        unreadCount: conv.unreadCount.businessOwner || 0
      };
    });

    res.json({
      success: true,
      customers: customers.map(customer => ({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        lastLogin: customer.lastLogin,
        joinedDate: customer.createdAt,
        hasConversation: !!conversationMap[customer._id.toString()],
        conversationId: conversationMap[customer._id.toString()]?.conversationId,
        unreadCount: conversationMap[customer._id.toString()]?.unreadCount || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch customers',
      error: error.message 
    });
  }
};

// Helper function
async function markMessagesAsRead(conversationId, userId) {
  try {
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: { readBy: { userId, readAt: new Date() } },
        status: 'read'
      }
    );

    // Reset unread count
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      if (conversation.businessOwnerId.toString() === userId.toString()) {
        conversation.unreadCount.businessOwner = 0;
      } else {
        conversation.unreadCount.customer = 0;
      }
      await conversation.save();
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

module.exports = exports;
