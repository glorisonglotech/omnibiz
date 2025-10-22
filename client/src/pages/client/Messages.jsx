import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, Send, Phone, Video, MoreVertical,
  Paperclip, Smile, Check, CheckCheck, Clock
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import api from '@/lib/api';

const ClientMessages = () => {
  const { customer } = useCustomerAuth();
  const { socket, connected } = useSocket();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (customer) {
      loadConversation();
    }
  }, [customer]);

  useEffect(() => {
    if (conversation && socket && connected) {
      socket.emit('join_conversation', conversation.id);
      setupSocketListeners();
    }

    return () => {
      if (conversation && socket) {
        socket.emit('leave_conversation', conversation.id);
        socket.off('message_received');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      }
    };
  }, [conversation, socket, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('message_received', (message) => {
      if (conversation && message.conversationId === conversation.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('user_typing', ({ conversationId, userId, userName }) => {
      if (conversation?.id === conversationId && userId !== customer._id) {
        setTypingUsers(prev => ({ ...prev, [userId]: userName }));
      }
    });

    socket.on('user_stopped_typing', ({ conversationId, userId }) => {
      if (conversation?.id === conversationId) {
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    });
  };

  const loadConversation = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        console.log('No customer token found');
        return;
      }

      const response = await api.get('/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.conversations && response.data.conversations.length > 0) {
        const conv = response.data.conversations[0];
        setConversation(conv);
        loadMessages(conv.id);
      } else {
        // No conversation exists yet - will be created when first message is sent
        setConversation({
          id: null,
          name: 'Business Owner',
          isOnline: false
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Set a placeholder conversation
      setConversation({
        id: null,
        name: 'Business Owner',
        isOnline: false
      });
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await api.get(`/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !customer) return;

    const messageContent = newMessage.trim();
    const tempId = Date.now();
    
    const message = {
      id: tempId,
      conversationId: conversation?.id,
      senderId: customer._id,
      senderName: customer.name,
      content: messageContent,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('customerToken');
      
      // If no conversation exists, create one first via API
      if (!conversation?.id) {
        const createResponse = await api.post('/messages/conversations', {
          businessOwnerId: customer.invitedBy,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (createResponse.data.success) {
          const newConv = createResponse.data.conversation;
          setConversation({
            id: newConv.id,
            name: 'Business Owner',
            isOnline: false
          });
          
          // Now send the message
          await api.post('/messages/send', {
            conversationId: newConv.id,
            content: messageContent
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Update message status
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: 'sent', conversationId: newConv.id } : m
          ));

          // Join conversation room
          if (socket && connected) {
            socket.emit('join_conversation', newConv.id);
          }
        }
      } else {
        // Send via socket if connected, otherwise API
        if (socket && connected) {
          socket.emit('send_message', {
            conversationId: conversation.id,
            message: messageContent,
            senderId: customer._id,
            senderName: customer.name
          });
        } else {
          await api.post('/messages/send', {
            conversationId: conversation.id,
            content: messageContent
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        // Update message status
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: 'sent' } : m
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Mark message as failed
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed' } : m
      ));
    }
  };

  const handleTyping = () => {
    if (!isTyping && conversation && socket) {
      setIsTyping(true);
      socket.emit('typing_start', {
        conversationId: conversation.id,
        userId: customer._id,
        userName: customer.name
      });

      setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing_stop', {
          conversationId: conversation.id,
          userId: customer._id
        });
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <p className="text-muted-foreground">Please log in to access messages</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Chat with {conversation?.name || 'Business Owner'} • {connected ? '🟢 Connected' : '🔴 Offline'}
        </p>
      </div>

      <Card className="h-[calc(100vh-12rem)] flex flex-col">
        {conversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{conversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {conversation.isOnline ? 'Active now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toast.info('Voice call - Coming soon')}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.info('Video call - Coming soon')}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === customer._id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isOwnMessage && getMessageStatus(message.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(typingUsers).length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Conversation</h3>
              <p className="text-muted-foreground">Start a conversation with the business owner</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClientMessages;
