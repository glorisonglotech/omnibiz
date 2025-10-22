# Client Storefront Chat & Notification System

## Overview
Enhanced client storefront with integrated real-time communication and comprehensive notification system. Customers can now seamlessly chat with business owners directly from the storefront interface.

---

## 🎯 Key Features

### 1. **Integrated Chat Tab**
- New "Chats" tab alongside Shop, Services, Orders, and Account
- Real-time messaging interface embedded in storefront
- Persistent conversation history
- Auto-conversation creation on first message

### 2. **Real-Time Notifications**
- In-app notification system with notification bell
- Push-style toast notifications
- Multiple notification types:
  - 📬 New messages
  - 🛒 Order updates
  - 📅 Appointment/Service status changes
  - 🔔 General announcements

### 3. **Enhanced Chat UI/UX**
- Modern, responsive chat interface
- Message timestamps and delivery indicators
- Typing indicators (animated dots)
- Scroll-to-latest messages
- Unread message tracking
- Connection status display
- Mobile-optimized design

### 4. **Customer-Initiated Conversations**
- Automatic business owner detection based on `invitedBy` relationship
- Smart conversation creation (creates on first message)
- Resume existing conversations seamlessly
- Fallback to API when WebSocket unavailable

---

## 📁 New Components

### 1. **NotificationContext.jsx**
**Location**: `/client/src/context/NotificationContext.jsx`

**Purpose**: Manages all notifications across the storefront

**Features**:
- Socket.IO event listeners for notifications
- Notification state management
- Unread count tracking
- Toast notification integration
- Automatic notification categorization

**Key Functions**:
```javascript
- addNotification(notification) // Add new notification
- markAsRead(notificationId) // Mark single as read
- markAllAsRead() // Mark all as read
- clearNotification(notificationId) // Remove notification
- clearAllNotifications() // Clear all
- resetMessageUnreadCount() // Reset chat unread count
```

**Socket Events Handled**:
- `new_message_notification` - New chat messages
- `order_updated` - Order status changes
- `appointment_updated` - Appointment updates
- `notification` - General notifications

### 2. **ChatInterface.jsx**
**Location**: `/client/src/components/storefront/ChatInterface.jsx`

**Purpose**: Embedded chat interface for customer-business owner communication

**Features**:
- Real-time messaging with Socket.IO
- Auto-conversation creation
- Message status tracking (sending → sent → delivered → read)
- Typing indicators
- Message timestamps (smart formatting)
- Connection status display
- Fallback to REST API
- Loading states
- Error handling

**Message Flow**:
1. Customer types message
2. Checks if conversation exists
3. Creates conversation if needed (via API)
4. Sends message via Socket.IO (or API fallback)
5. Updates message status
6. Joins conversation room
7. Receives real-time updates

### 3. **NotificationBell.jsx**
**Location**: `/client/src/components/storefront/NotificationBell.jsx`

**Purpose**: Notification center in storefront header

**Features**:
- Unread count badge
- Notification list with categories
- Mark as read functionality
- Clear notifications
- Icon indicators per notification type
- Relative timestamps
- Swipe to delete

**Notification Types & Icons**:
- 📬 Message → Blue MessageCircle
- 🛒 Order → Green ShoppingCart
- 📅 Appointment → Purple Calendar
- 🔔 General → Gray Bell

---

## 🎨 UI/UX Enhancements

### **Chat Interface Design**
```
┌─────────────────────────────────────┐
│ 👤 Business Owner        🔴 Online  │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Hello! How can I help?        ✓✓  │  ← Received
│  14:30                              │
│                                     │
│                    Can I order? ✓✓  │  ← Sent
│                           14:35     │
│                                     │
│  ● ● ●  (typing...)                │  ← Typing
│                                     │
├─────────────────────────────────────┤
│ 📎  [Type a message...]  😊  ➤    │  ← Input
└─────────────────────────────────────┘
```

### **Notification Bell**
```
┌─────────────────────┐
│  🔔 (3)            │  ← Badge shows unread count
└─────────────────────┘

Click opens:
┌──────────────────────────────────────┐
│ Notifications              Clear All  │
│ You have 3 unread notifications      │
├──────────────────────────────────────┤
│ 📬 New Message              5m ago   │
│    John: Thanks for your help!       │
│                                   ✕  │
├──────────────────────────────────────┤
│ 🛒 Order Update            10m ago   │
│    Order #123 - Confirmed            │
│                                   ✕  │
├──────────────────────────────────────┤
│ 📅 Appointment Update       1h ago   │
│    Your appointment - Confirmed      │
│                                   ✕  │
└──────────────────────────────────────┘
```

### **Storefront Tabs**
```
┌─────────────────────────────────────────────────┐
│  🛒 Shop │ 📅 Services │ 💬 Chats │ 📦 Orders │ 👤 Account │
└─────────────────────────────────────────────────┘
          ↑
    New Chat Tab
```

---

## 🔧 Technical Implementation

### **Context Integration**
```javascript
// App.jsx wrapper hierarchy
<ThemeProvider>
  <PWAProvider>
    <AuthProvider>
      <CustomerAuthProvider>
        <SocketProvider>
          <NotificationProvider>  ← New
            <ClientStorefront />
          </NotificationProvider>
        </SocketProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  </PWAProvider>
</ThemeProvider>
```

### **Socket.IO Integration**
The chat interface uses existing Socket.IO connection from `SocketContext`:

```javascript
// Auto-connect when component mounts
useEffect(() => {
  if (customer && conversation?.id) {
    socket.emit('join_conversation', conversation.id);
  }
}, [customer, conversation]);

// Listen for messages
socket.on('message_received', (message) => {
  setMessages(prev => [...prev, message]);
});

// Send messages
socket.emit('send_message', {
  conversationId,
  message: content,
  senderId: customer._id,
  senderName: customer.name
});
```

### **Conversation Auto-Creation**
```javascript
// First message flow
if (!conversation?.id) {
  // 1. Create conversation via API
  const response = await api.post('/messages/conversations', {}, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  
  // 2. Set conversation state
  setConversation(response.data.conversation);
  
  // 3. Send message
  await api.post('/messages/send', {
    conversationId: newConv.id,
    content: messageContent
  });
  
  // 4. Join Socket.IO room
  socket.emit('join_conversation', newConv.id);
}
```

---

## 📊 State Management

### **NotificationContext State**
```javascript
{
  notifications: [
    {
      id: timestamp,
      type: 'message' | 'order' | 'appointment' | 'general',
      title: 'Notification Title',
      message: 'Notification content',
      timestamp: Date,
      read: boolean,
      data: { ...additionalData }
    }
  ],
  unreadCount: number,
  messageUnreadCount: number
}
```

### **ChatInterface State**
```javascript
{
  conversation: {
    id: conversationId,
    name: 'Business Owner',
    isOnline: boolean
  },
  messages: [
    {
      id: messageId,
      tempId: 'temp_timestamp', // For optimistic updates
      senderId: userId,
      senderName: 'Customer Name',
      content: 'Message text',
      timestamp: Date,
      status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    }
  ],
  isTyping: boolean,
  typingUsers: { userId: userName },
  loading: boolean,
  sending: boolean
}
```

---

## 🚀 Usage Guide

### **For Customers**

1. **Access Chat**
   - Navigate to client storefront
   - Click "Chats" tab or message icon in header
   - Login if not already authenticated

2. **Send First Message**
   - Type message in input field
   - Press Enter or click Send
   - Conversation auto-creates with business owner
   - Message appears immediately (optimistic update)

3. **View Notifications**
   - Click bell icon in header
   - See all recent notifications
   - Mark individual or all as read
   - Clear unwanted notifications

4. **Chat Features**
   - See when business owner is typing
   - View message delivery status (✓ sent, ✓✓ delivered/read)
   - Scroll to see message history
   - Connection status shown in header

### **For Business Owners**

1. **View Customer Messages**
   - Go to `/dashboard/messages`
   - See "Customers" tab with all customers
   - Click "Chat" or "Open" to start/continue conversation

2. **Receive Notifications**
   - Real-time toast notifications for new messages
   - Unread count badges
   - Desktop notifications (if enabled)

---

## 🔔 Notification Types

### **Message Notifications**
```javascript
{
  type: 'message',
  title: 'New Message',
  message: 'John: Hello! Can you help me?',
  data: {
    conversationId: 'conv_123',
    from: 'John Doe',
    preview: 'Hello! Can you help me?'
  }
}
```

### **Order Notifications**
```javascript
{
  type: 'order',
  title: 'Order Update',
  message: 'Order #ORD-123 - Confirmed',
  data: {
    orderNumber: 'ORD-123',
    status: 'confirmed',
    orderId: 'order_id'
  }
}
```

### **Appointment Notifications**
```javascript
{
  type: 'appointment',
  title: 'Appointment Update',
  message: 'Your haircut appointment - Confirmed',
  data: {
    appointmentId: 'appt_123',
    status: 'confirmed',
    serviceName: 'Haircut'
  }
}
```

---

## 🎯 Message Status Flow

```
Customer sends message
    ↓
Status: sending (⏱️)
    ↓
Sent to server
    ↓
Status: sent (✓)
    ↓
Delivered to recipient
    ↓
Status: delivered (✓✓)
    ↓
Recipient reads message
    ↓
Status: read (✓✓ blue)
```

---

## 🛠️ API Integration

### **Endpoints Used**
```
GET  /api/messages/conversations      # Get user's conversations
POST /api/messages/conversations      # Create new conversation
GET  /api/messages/conversations/:id  # Get messages
POST /api/messages/send               # Send message (fallback)
```

### **Authentication**
All requests use customer JWT token:
```javascript
headers: {
  Authorization: `Bearer ${customerToken}`
}
```

Token stored in `localStorage` as `customerToken`

---

## 📱 Responsive Design

### **Desktop** (≥1024px)
- Full 5-tab layout visible
- Chat interface: 600px height
- Notification panel: Side sheet
- All features accessible

### **Tablet** (768px - 1023px)
- Tab labels show on medium screens
- Chat adjusts to container
- Notification bell always visible

### **Mobile** (<768px)
- Icon-only tabs
- Full-width chat interface
- Condensed notification list
- Touch-optimized interactions

---

## 🔒 Security Features

1. **Authentication Required**
   - Must be logged in to access chat
   - Token validated on all API calls
   - Socket.IO authenticated connections

2. **Conversation Access Control**
   - Customers can only chat with their business owner (`invitedBy`)
   - Server validates conversation participants
   - No cross-customer messaging

3. **XSS Prevention**
   - Message content sanitized
   - No HTML rendering in messages
   - Safe text display only

---

## 🐛 Error Handling

### **Connection Errors**
```javascript
if (!connected) {
  // Show "Connecting..." message
  // Disable input field
  // Queue messages for later
  // Fallback to API
}
```

### **Send Failures**
```javascript
catch (error) {
  // Mark message as failed (❌)
  // Show error toast
  // Keep message in UI for retry
  // Log error for debugging
}
```

### **No Conversation**
```javascript
if (!conversation?.id) {
  // Auto-create on first message
  // Show loading state
  // Handle creation errors gracefully
}
```

---

## ⚡ Performance Optimizations

1. **Message Virtualization**
   - ScrollArea for efficient rendering
   - Limit: 500 messages per load
   - Lazy load older messages

2. **Debounced Typing**
   - 3-second timeout
   - Prevents spam
   - Reduces socket events

3. **Optimistic Updates**
   - Instant message display
   - Update on server confirmation
   - Better perceived performance

4. **Notification Limit**
   - Keep last 50 notifications
   - Auto-trim older ones
   - Prevent memory bloat

---

## 🧪 Testing Checklist

- [x] Customer can access chat tab
- [x] First message creates conversation
- [x] Messages sync in real-time
- [x] Typing indicators work
- [x] Notifications appear
- [x] Unread counts update
- [x] Mark as read works
- [x] Clear notifications works
- [x] Fallback to API works
- [x] Reconnection handling
- [x] Mobile responsive
- [x] Desktop responsive
- [x] Authentication required
- [x] Connection status display
- [x] Message status indicators

---

## 🎓 Future Enhancements

### **Planned Features**
- [ ] File/image attachments
- [ ] Voice messages
- [ ] Read receipts per message
- [ ] Message search
- [ ] Conversation archiving
- [ ] Emoji picker
- [ ] Message reactions
- [ ] Push notifications (PWA)
- [ ] Desktop notifications
- [ ] Message templates
- [ ] Auto-responses
- [ ] Chat history export

### **Advanced Features**
- [ ] Video call integration
- [ ] Voice call support
- [ ] Screen sharing
- [ ] Group chats
- [ ] Message encryption
- [ ] Scheduled messages
- [ ] Message threading
- [ ] Quick replies
- [ ] Chatbot integration

---

## 📖 Code Examples

### **Using Notifications in Components**
```javascript
import { useNotifications } from '@/context/NotificationContext';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount,
    addNotification,
    markAsRead 
  } = useNotifications();

  // Add custom notification
  const notifyUser = () => {
    addNotification({
      id: Date.now(),
      type: 'general',
      title: 'Custom Alert',
      message: 'Something happened!',
      timestamp: new Date(),
      read: false,
      data: { customData: 'value' }
    });
  };

  return (
    <div>
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </div>
  );
};
```

### **Socket Event Handling**
```javascript
// In your component
useEffect(() => {
  if (!socket) return;

  socket.on('custom_event', (data) => {
    // Handle event
    addNotification({
      type: 'general',
      title: data.title,
      message: data.message,
      timestamp: new Date(),
      read: false
    });
  });

  return () => {
    socket.off('custom_event');
  };
}, [socket]);
```

---

## 🤝 Support & Troubleshooting

### **Common Issues**

**Issue**: Messages not appearing in real-time
**Solution**: 
1. Check Socket.IO connection status
2. Verify conversation room joined
3. Check browser console for errors
4. Test with API fallback

**Issue**: Notifications not showing
**Solution**:
1. Verify NotificationProvider wraps component
2. Check socket listeners registered
3. Test with manual notification trigger

**Issue**: Can't send messages
**Solution**:
1. Verify customer is logged in
2. Check token validity
3. Confirm conversation exists or creates
4. Check network/API errors

---

## 📚 Related Documentation

- [MESSAGING_SYSTEM.md](/MESSAGING_SYSTEM.md) - Backend messaging architecture
- [Socket.IO Docs](https://socket.io/docs/v4/) - Real-time communication
- [React Context](https://react.dev/reference/react/useContext) - State management
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

## ✅ Summary

The enhanced client storefront now provides:
- ✅ Integrated chat functionality
- ✅ Real-time notifications
- ✅ Customer-initiated conversations
- ✅ Modern, responsive UI
- ✅ Comprehensive error handling
- ✅ Seamless Socket.IO integration
- ✅ Production-ready implementation

Customers can now communicate directly with business owners without leaving the storefront, creating a seamless, engaging experience! 🎉
