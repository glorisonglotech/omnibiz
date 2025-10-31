import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageCircle, Send, Phone, Video, MoreVertical,
  Paperclip, Smile, Check, CheckCheck, Clock, AlertCircle, Loader2,
  Download, Trash2, Archive, Settings, UserPlus, Info
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useSocket } from '@/context/SocketContext';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import api from '@/lib/api';

const ChatInterface = () => {
  const { customer } = useCustomerAuth();
  const { socket, connected } = useSocket();
  const { resetMessageUnreadCount } = useNotifications();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (customer) {
      loadConversation();
      resetMessageUnreadCount();
    }
  }, [customer]);

  useEffect(() => {
    // Monitor connection status
    if (socket) {
      if (connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connecting');
      }
    } else {
      setConnectionStatus('disconnected');
    }
  }, [socket, connected]);

  useEffect(() => {
    if (conversation?.id && socket && connected) {
      socket.emit('join_conversation', conversation.id);
      setupSocketListeners();
    }

    return () => {
      if (conversation?.id && socket) {
        socket.emit('leave_conversation', conversation.id);
        socket.off('message_received');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
        socket.off('message_sent');
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
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
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

    socket.on('message_sent', (message) => {
      // Update message status from sending to sent
      setMessages(prev => prev.map(m => 
        m.tempId && m.content === message.content ? { ...message, status: 'delivered' } : m
      ));
    });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('customerToken');
      if (!token) {
        setConversation({
          id: null,
          name: 'Business Owner',
          isOnline: false
        });
        setLoading(false);
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
        // No conversation exists yet
        setConversation({
          id: null,
          name: 'Business Owner',
          isOnline: false
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConversation({
        id: null,
        name: 'Business Owner',
        isOnline: false
      });
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await api.get(`/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !customer || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}`;
    
    const tempMessage = {
      id: tempId,
      tempId: tempId,
      conversationId: conversation?.id,
      senderId: customer._id,
      senderName: customer.name,
      content: messageContent,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const token = localStorage.getItem('customerToken');
      
      // If no conversation exists, create one first
      if (!conversation?.id) {
        const createResponse = await api.post('/messages/conversations', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (createResponse.data.success) {
          console.log('✅ Conversation created successfully');
          const newConv = createResponse.data.conversation;
          setConversation({
            id: newConv.id,
            name: 'Business Owner',
            isOnline: false
          });
          
          // Send message
          await api.post('/messages/send', {
            conversationId: newConv.id,
            content: messageContent
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Update temp message
          setMessages(prev => prev.map(m => 
            m.tempId === tempId ? { ...m, status: 'sent', conversationId: newConv.id } : m
          ));

          // Join conversation room
          if (socket && connected) {
            socket.emit('join_conversation', newConv.id);
            setupSocketListeners();
          }
        }
      } else {
        // Send via socket if connected
        if (socket && connected) {
          socket.emit('send_message', {
            conversationId: conversation.id,
            message: messageContent,
            senderId: customer._id,
            senderName: customer.name
          });
          
          setMessages(prev => prev.map(m => 
            m.tempId === tempId ? { ...m, status: 'sent' } : m
          ));
        } else {
          // Fallback to API
          await api.post('/messages/send', {
            conversationId: conversation.id,
            content: messageContent
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setMessages(prev => prev.map(m => 
            m.tempId === tempId ? { ...m, status: 'sent' } : m
          ));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Better error message
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMsg);
      
      setMessages(prev => prev.map(m => 
        m.tempId === tempId ? { ...m, status: 'failed' } : m
      ));
      
      // Remove failed temp message after 3 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.tempId !== tempId));
      }, 3000);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && conversation?.id && socket && connected) {
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
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  if (!customer) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="p-12 text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground">Sign in to chat with the business owner</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {conversation?.name?.[0] || 'B'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{conversation?.name || 'Business Owner'}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {connectionStatus === 'connecting' ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => toast.info('Voice call - Coming soon')}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast.info('Video call - Coming soon')}>
              <Video className="h-4 w-4" />
            </Button>

            {/* More Options Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const chatData = JSON.stringify(messages, null, 2);
                  const blob = new Blob([chatData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `chat-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
                  a.click();
                  toast.success('Chat exported successfully');
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (confirm('Are you sure you want to clear this conversation?')) {
                    setMessages([]);
                    toast.success('Conversation cleared');
                  }
                }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Conversation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const chatHistory = {
                    id: Date.now(),
                    date: new Date(),
                    messages: messages,
                    participant: selectedChat?.name || 'Support'
                  };
                  const saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
                  saved.push(chatHistory);
                  localStorage.setItem('chat_history', JSON.stringify(saved));
                  toast.success('Chat archived');
                }}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Chat settings - Coming soon')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Chat Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Add participant - Coming soon')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Participant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Chat info - Coming soon')}>
                  <Info className="mr-2 h-4 w-4" />
                  Chat Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-1">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start a conversation with {conversation?.name}</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.senderId === customer._id;
                  const showTimestamp = index === 0 || 
                    (new Date(message.timestamp) - new Date(messages[index - 1].timestamp)) > 3600000;

                  return (
                    <div key={message.id || message.tempId}>
                      {showTimestamp && (
                        <div className="text-center text-xs text-muted-foreground my-4">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                      )}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 opacity-70">{message.senderName}</p>
                          )}
                          <p className="text-sm break-words">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {isOwnMessage && getMessageStatus(message.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
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
        )}
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" disabled>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!connected || sending}
          />
          <Button type="button" variant="ghost" size="icon" disabled>
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        {connectionStatus === 'connecting' && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting to chat server...</span>
          </div>
        )}
        {connectionStatus === 'disconnected' && (
          <div className="flex items-center justify-center gap-2 text-xs text-red-500 mt-2">
            <AlertCircle className="h-3 w-3" />
            <span>Connection lost. Retrying...</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatInterface;
