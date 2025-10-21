import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, Send, Search, Phone, Video, MoreVertical, 
  Paperclip, Smile, Check, CheckCheck, Clock, Pin, Archive,
  Mic, Image as ImageIcon, FileText, Plus, Users, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';

const Messages = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('message_received');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('message_received', (message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages(prev => [...prev, message]);
        markAsRead(message.id);
      }
      // Update conversation list
      updateConversationLastMessage(message);
    });

    socket.on('user_typing', ({ conversationId, userId, userName }) => {
      if (activeConversation?.id === conversationId) {
        setTypingUsers(prev => ({ ...prev, [userId]: userName }));
      }
    });

    socket.on('user_stopped_typing', ({ conversationId, userId }) => {
      if (activeConversation?.id === conversationId) {
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fallback to demo conversations if API fails
      const demoConversations = [
        {
          id: 1,
          name: 'Support Team',
          avatar: '',
          lastMessage: 'How can we help you today?',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: true,
          type: 'support'
        },
        {
          id: 2,
          name: 'Sales Department',
          avatar: '',
          lastMessage: 'Your order has been processed',
          lastMessageTime: new Date(Date.now() - 3600000),
          unreadCount: 2,
          isOnline: true,
          type: 'team'
        },
        {
          id: 3,
          name: 'Team Chat',
          avatar: '',
          lastMessage: 'Meeting at 3 PM',
          lastMessageTime: new Date(Date.now() - 7200000),
          unreadCount: 5,
          isOnline: false,
          type: 'group'
        }
      ];

      try {
        const response = await api.get('/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data.conversations || demoConversations);
      } catch (error) {
        console.log('Using demo conversations');
        setConversations(demoConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Demo messages
      const demoMessages = [
        {
          id: 1,
          conversationId,
          senderId: 'other',
          senderName: conversations.find(c => c.id === conversationId)?.name || 'Support',
          content: 'Hello! How can I help you today?',
          timestamp: new Date(Date.now() - 3600000),
          status: 'read'
        },
        {
          id: 2,
          conversationId,
          senderId: user._id,
          senderName: user.name,
          content: 'Hi! I need some assistance.',
          timestamp: new Date(Date.now() - 3000000),
          status: 'read'
        },
        {
          id: 3,
          conversationId,
          senderId: 'other',
          senderName: conversations.find(c => c.id === conversationId)?.name || 'Support',
          content: 'Of course! What do you need help with?',
          timestamp: new Date(Date.now() - 2400000),
          status: 'delivered'
        }
      ];

      try {
        const response = await api.get(`/messages/conversations/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data.messages || demoMessages);
      } catch (error) {
        console.log('Using demo messages');
        setMessages(demoMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const message = {
      id: Date.now(),
      conversationId: activeConversation.id,
      senderId: user._id,
      senderName: user.name,
      content: newMessage,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (socket && connected) {
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          message: newMessage,
          senderId: user._id,
          senderName: user.name
        });
      } else {
        // Fallback to API
        await api.post('/messages/send', {
          conversationId: activeConversation.id,
          content: newMessage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update message status
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'sent' } : m
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'failed' } : m
      ));
    }
  };

  const handleTyping = () => {
    if (!isTyping && activeConversation && socket) {
      setIsTyping(true);
      socket.emit('typing_start', {
        conversationId: activeConversation.id,
        userId: user._id,
        userName: user.name
      });

      setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing_stop', {
          conversationId: activeConversation.id,
          userId: user._id
        });
      }, 3000);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const updateConversationLastMessage = (message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversationId 
        ? { 
            ...conv, 
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: conv.id === activeConversation?.id ? 0 : conv.unreadCount + 1
          }
        : conv
    ));
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

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your team and support • {connected ? '🟢 Connected' : '🔴 Offline'}</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <Card className="col-span-12 lg:col-span-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                    activeConversation?.id === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>
                          {conv.type === 'group' ? <Users className="h-6 w-6" /> : conv.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <Badge className="mt-1 bg-primary text-primary-foreground">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-12 lg:col-span-8 h-full flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeConversation.avatar} />
                      <AvatarFallback>
                        {activeConversation.type === 'group' ? <Users className="h-5 w-5" /> : activeConversation.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{activeConversation.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.isOnline ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toast.info('Voice call - Coming soon')}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => window.open('/dashboard/sessions', '_blank')}>
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
                      const isOwnMessage = message.senderId === user._id;
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
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" />
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
                <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                <p className="text-muted-foreground">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
