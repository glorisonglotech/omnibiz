# OmniBiz Messaging System Documentation

## Overview
A comprehensive real-time messaging system enabling bidirectional communication between business owners and their customers. Built with Socket.IO for real-time updates and MongoDB for persistent message storage.

## Architecture

### Tech Stack
- **Frontend**: React with Socket.IO client
- **Backend**: Node.js + Express + Socket.IO 4.8.1
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based (supports both User and Customer tokens)

### Key Components

#### Backend
1. **Models**
   - `Conversation.js` - Stores conversation metadata between business owner and customer
   - `Message.js` - Stores individual messages with polymorphic sender references
   - `Customer.js` - Customer data linked to business owners via `invitedBy`
   - `User.js` - Business owner/admin accounts

2. **Controllers** (`/server/controllers/messageController.js`)
   - `getConversations` - Retrieve all conversations for authenticated user
   - `getCustomers` - Get all customers for business owner
   - `getMessages` - Fetch messages for a specific conversation
   - `sendMessage` - Send a new message
   - `createConversation` - Create or retrieve conversation
   - `markAsRead` - Mark messages as read

3. **Routes** (`/server/routes/messageRoutes.js`)
   - `GET /api/messages/conversations` - List conversations
   - `POST /api/messages/conversations` - Create conversation
   - `GET /api/messages/conversations/:id` - Get messages
   - `GET /api/messages/customers` - List customers (business owner only)
   - `POST /api/messages/send` - Send message
   - `POST /api/messages/:messageId/read` - Mark as read

4. **Socket.IO** (`/server/config/socket.js`)
   - Dual authentication (User + Customer)
   - Real-time message delivery
   - Typing indicators
   - Connection lifecycle management
   - Room-based messaging

#### Frontend

1. **Dashboard Messages** (`/client/src/pages/dashboard/Messages.jsx`)
   - **Tabs**: Conversations and Customers view
   - **Customer List**: Shows all customers with order history
   - **Start Conversation**: Click to initiate chat with any customer
   - **Real-time Chat**: Socket.IO powered messaging
   - **Typing Indicators**: See when customers are typing
   - **Message Status**: Sent, delivered, read indicators
   - **Search**: Filter conversations and customers

2. **Client Messages** (`/client/src/pages/client/Messages.jsx`)
   - **Auto-conversation**: Creates conversation on first message
   - **Real-time Sync**: Instant message delivery
   - **Fallback Support**: Works via API if WebSocket fails
   - **Mobile Responsive**: Optimized for all devices

3. **Navigation**
   - Dashboard: `/dashboard/messages`
   - Client Storefront: `/client/messages`
   - Account tab quick action button in storefront

## Features

### ✅ Implemented

1. **Customer Retrieval**
   - Business owners can view all their customers
   - Shows customer stats (orders, spend, last login)
   - Indicates existing conversations with unread count

2. **Real-time Messaging**
   - Socket.IO bidirectional communication
   - Instant message delivery
   - Typing indicators
   - Online/offline status

3. **Conversation Management**
   - Automatic conversation creation
   - Persistent message history
   - Unread message tracking
   - Last message preview

4. **Authentication & Authorization**
   - Dual auth support (User + Customer tokens)
   - JWT verification
   - Role-based access control
   - Secure conversation access

5. **UI/UX**
   - Modern, responsive design
   - Tabs for conversations/customers
   - Search functionality
   - Loading states and error handling
   - Toast notifications

### 🔒 Security Features

1. **Access Control**
   - Only conversation participants can view messages
   - Customers can only message their referring business owner
   - Business owners can only message their customers

2. **Token Validation**
   - JWT verification on all endpoints
   - Socket.IO authentication middleware
   - Token type detection (user vs customer)

3. **Data Validation**
   - Input sanitization
   - Message length limits (5000 chars)
   - Conversation participant verification

## Database Schema

### Conversation Model
```javascript
{
  businessOwnerId: ObjectId (ref: User),
  customerId: ObjectId (ref: Customer),
  businessOwnerName: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  lastMessage: {
    content: String,
    senderId: ObjectId,
    timestamp: Date
  },
  unreadCount: {
    businessOwner: Number,
    customer: Number
  },
  status: String (active/archived/blocked),
  tags: [String],
  priority: String (low/normal/high/urgent)
}
```

### Message Model
```javascript
{
  conversationId: ObjectId (ref: Conversation),
  senderId: ObjectId (polymorphic),
  senderModel: String (User/Customer),
  senderName: String,
  senderRole: String (business_owner/customer/admin),
  content: String (max 5000),
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }],
  status: String (sent/delivered/read/failed),
  readBy: [{
    userId: ObjectId,
    readAt: Date
  }],
  isDeleted: Boolean
}
```

## Socket.IO Events

### Client → Server
- `join_conversation(conversationId)` - Join a conversation room
- `leave_conversation(conversationId)` - Leave a conversation room
- `send_message({ conversationId, message, senderId, senderName })` - Send message
- `typing_start({ conversationId, userId, userName })` - Start typing
- `typing_stop({ conversationId, userId })` - Stop typing

### Server → Client
- `message_received(message)` - New message in conversation
- `message_sent(message)` - Confirmation of sent message
- `user_typing({ conversationId, userId, userName })` - User is typing
- `user_stopped_typing({ conversationId, userId })` - User stopped typing
- `new_message_notification({ conversationId, from, preview })` - Message notification
- `message_error({ error })` - Error occurred

## API Endpoints

### GET /api/messages/conversations
**Auth**: Both User and Customer
**Description**: Retrieve all conversations for authenticated user
**Response**:
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conv_id",
      "name": "Customer/Business Name",
      "email": "email@example.com",
      "phone": "+254...",
      "lastMessage": "Message preview",
      "lastMessageTime": "2025-10-22T...",
      "unreadCount": 2,
      "isOnline": false,
      "type": "direct"
    }
  ]
}
```

### POST /api/messages/conversations
**Auth**: Both User and Customer
**Description**: Create or get existing conversation
**Request Body** (Business Owner):
```json
{
  "customerId": "customer_id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+254..."
}
```
**Request Body** (Customer): Empty (uses customer token data)

### GET /api/messages/conversations/:conversationId
**Auth**: Both User and Customer (participants only)
**Description**: Get all messages in a conversation
**Response**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_id",
      "conversationId": "conv_id",
      "senderId": "user_id",
      "senderName": "John Doe",
      "content": "Hello!",
      "timestamp": "2025-10-22T...",
      "status": "read"
    }
  ]
}
```

### GET /api/messages/customers
**Auth**: Business Owner only
**Description**: Get all customers with conversation status
**Response**:
```json
{
  "success": true,
  "customers": [
    {
      "id": "customer_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+254...",
      "totalOrders": 5,
      "totalSpent": 15000,
      "lastLogin": "2025-10-22T...",
      "joinedDate": "2025-09-01T...",
      "hasConversation": true,
      "conversationId": "conv_id",
      "unreadCount": 3
    }
  ]
}
```

### POST /api/messages/send
**Auth**: Both User and Customer
**Description**: Send a new message
**Request Body**:
```json
{
  "conversationId": "conv_id",
  "content": "Message text",
  "attachments": []
}
```

## Usage Examples

### Starting a Conversation (Business Owner)
```javascript
// In Dashboard Messages component
const startConversation = async (customer) => {
  const response = await api.post('/messages/conversations', {
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.data.success) {
    setActiveConversation(response.data.conversation);
  }
};
```

### Sending a Message (Customer)
```javascript
// In Client Messages component
const sendMessage = async (e) => {
  e.preventDefault();
  
  // Auto-create conversation if needed
  if (!conversation?.id) {
    const createResponse = await api.post('/messages/conversations', {}, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    // Then send message...
  }
  
  // Send via Socket.IO
  socket.emit('send_message', {
    conversationId: conversation.id,
    message: newMessage,
    senderId: customer._id,
    senderName: customer.name
  });
};
```

## Troubleshooting

### Issue: Service Worker Network Error
**Error**: `FetchEvent resulted in a network error response`
**Solution**: This is a PWA service worker issue unrelated to messaging. Update `vite.config.js` or clear service worker cache.

### Issue: Socket not connecting
**Check**:
1. Token is valid and passed in `socket.handshake.auth.token`
2. CORS settings in `socket.js` include your client URL
3. Server is running on correct port (5000)

### Issue: Messages not syncing
**Check**:
1. Both users are in the same conversation room
2. Socket event listeners are properly registered
3. ConversationId matches on both sides

### Issue: Unauthorized errors
**Check**:
1. Correct token (customerToken for customers, token for users)
2. Token not expired
3. User is participant in the conversation

## Future Enhancements

- [ ] File/image attachments
- [ ] Voice messages
- [ ] Message search
- [ ] Conversation archiving
- [ ] Group conversations
- [ ] Message reactions/emoji
- [ ] Read receipts per message
- [ ] Push notifications
- [ ] Message encryption
- [ ] Chat templates/quick replies

## Testing

### Manual Testing Checklist
1. ✅ Business owner can view customer list
2. ✅ Business owner can start conversation with customer
3. ✅ Customer can send first message (auto-creates conversation)
4. ✅ Messages sync in real-time on both sides
5. ✅ Typing indicators work
6. ✅ Message status updates correctly
7. ✅ Unread count updates
8. ✅ Search filters conversations/customers
9. ✅ Reconnection after disconnect works
10. ✅ Fallback to API when Socket unavailable

## Performance Considerations

- Message pagination (500 messages per load)
- Conversation limit (200 per user)
- Debounced typing indicators (3 second timeout)
- Lazy loading of customer list
- Efficient MongoDB indexes on conversationId and senderId

## Conclusion

The messaging system provides a robust, real-time communication channel between business owners and customers. It's secure, scalable, and designed to handle dropped connections gracefully. The dual authentication system ensures both user types can communicate seamlessly while maintaining strict access controls.

For support or questions, refer to the main project documentation or contact the development team.
