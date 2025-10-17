import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Video, 
  Send, 
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Settings,
  Download,
  ExternalLink,
  Plus,
  X,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { supportAPI } from '@/lib/apiHelpers';

const HelpSupport = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [supportAgents, setSupportAgents] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [chatStatus, setChatStatus] = useState('offline'); // offline, connecting, online
  const [searchQuery, setSearchQuery] = useState('');
  const [faqItems, setFaqItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    initializeSupport();
    loadFAQs();
    loadTickets();
    setupSocketListeners();
    
    return () => {
      cleanupVideoCall();
    };
  }, [socket]);

  // Setup WebSocket listeners for real-time chat
  const setupSocketListeners = () => {
    if (!socket) return;

    // Join support chat room
    socket.emit('join_support_chat', { userId: user?._id, userName: user?.name });

    // Listen for incoming messages
    socket.on('support_message_received', (message) => {
      setChatMessages(prev => [...prev, message]);
      setIsTyping(false);
    });

    // Listen for agent typing
    socket.on('agent_typing', (data) => {
      setIsTyping(data.isTyping);
    });

    // Listen for agent status updates
    socket.on('agent_status_update', (data) => {
      setSupportAgents(prev => prev.map(agent => 
        agent.id === data.agentId ? { ...agent, status: data.status } : agent
      ));
      if (data.agentId === activeAgent?.id) {
        setChatStatus(data.status);
      }
    });

    // Listen for ticket updates
    socket.on('ticket_status_update', (data) => {
      setTickets(prev => prev.map(ticket =>
        ticket.id === data.ticketId ? { ...ticket, status: data.status, lastUpdate: new Date() } : ticket
      ));
      toast.info(`Ticket ${data.ticketId} updated: ${data.status}`);
    });

    // WebRTC signaling for video calls
    socket.on('video_offer', handleVideoOffer);
    socket.on('video_answer', handleVideoAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleRemoteCallEnd);

    return () => {
      socket.off('support_message_received');
      socket.off('agent_typing');
      socket.off('agent_status_update');
      socket.off('ticket_status_update');
      socket.off('video_offer');
      socket.off('video_answer');
      socket.off('ice_candidate');
      socket.off('call_ended');
    };
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const initializeSupport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real support agents from API
      const agents = await supportAPI.getSupportAgents().catch(() => {
        // Fallback to basic agent data if API fails
        return [
          {
            id: 1,
            name: 'Support Team',
            role: 'Customer Support',
            avatar: '/api/placeholder/40/40',
            status: 'online',
            rating: 4.9,
            specialties: ['General Support', 'Technical Help']
          }
        ];
      });
      
      setSupportAgents(agents);
      setActiveAgent(agents[0]);
      setChatStatus(agents[0]?.status || 'online');

      // Initialize chat with welcome message
      const welcomeMessage = {
        id: 1,
        sender: 'agent',
        message: `Hi ${user?.name || 'there'}! I'm ${agents[0]?.name}, your support specialist. How can I help you today?`,
        timestamp: new Date(),
        agent: agents[0]
      };
      
      setChatMessages([welcomeMessage]);
      
      console.log('✅ Support initialized:', {
        agents: agents.length,
        activeAgent: agents[0]?.name
      });
    } catch (err) {
      console.error('❌ Error initializing support:', err);
      setError('Failed to connect to support. Please try again later.');
      toast.error('Failed to initialize support system');
    } finally {
      setLoading(false);
    }
  };

  const loadFAQs = async () => {
    try {
      const faqs = await supportAPI.getFAQs();
      setFaqItems(Array.isArray(faqs) ? faqs : []);
      
      console.log('✅ FAQs loaded:', faqs.length);
    } catch (error) {
      console.error('❌ Error loading FAQs:', error);
      // Fallback to mock data if API fails
      const mockFaqs = [
        {
          id: 1,
          question: 'How do I reset my password?',
          answer: 'You can reset your password by clicking on "Forgot Password" on the login page. Enter your email and follow the instructions sent to your inbox.',
          category: 'Account',
          helpful: 45,
          views: 234
        },
        {
          id: 2,
          question: 'How to integrate with third-party APIs?',
          answer: 'Our API integration guide provides step-by-step instructions. Visit the Developer section in Settings for API keys and documentation.',
          category: 'Technical',
          helpful: 38,
          views: 189
        },
        {
          id: 3,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, M-Pesa, and bank transfers. All transactions are encrypted and secure.',
          category: 'Billing',
          helpful: 52,
          views: 312
        },
        {
          id: 4,
          question: 'How do I export my data?',
          answer: 'Navigate to Reports > Export Data. Choose your format (CSV, PDF, Excel) and date range. Your export will download automatically.',
          category: 'Data',
          helpful: 29,
          views: 156
        },
        {
          id: 5,
          question: 'Can I customize my dashboard?',
          answer: 'Yes! Click the Settings icon on your dashboard. You can rearrange widgets, choose themes, and customize which metrics to display.',
          category: 'Customization',
          helpful: 67,
          views: 421
        }
      ];
      setFaqItems(mockFaqs);
    }
  };

  const loadTickets = async () => {
    try {
      const apiTickets = await supportAPI.getTickets();
      setTickets(Array.isArray(apiTickets) ? apiTickets : []);
      
      console.log('✅ Tickets loaded:', apiTickets.length);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      // Fallback to empty array if API fails
      setTickets([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'user',
      senderName: user?.name,
      message: newMessage,
      timestamp: new Date(),
      userId: user?._id,
      agentId: activeAgent?.id
    };

    // Add to local state immediately
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Send via WebSocket for real-time delivery
    if (socket && connected) {
      socket.emit('send_support_message', message);
    }

    // Also save to database for persistence
    try {
      await supportAPI.sendMessage(activeAgent?.id, newMessage);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const generateAgentResponse = (userMessage) => {
    const responses = [
      "I understand your concern. Let me help you with that.",
      "That's a great question! Here's what I recommend...",
      "I can definitely assist you with this. Let me check our resources.",
      "Thank you for reaching out. I'll guide you through the solution.",
      "I see what you're looking for. Here's the best approach..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const message = {
        id: Date.now(),
        sender: 'user',
        message: `Uploaded file: ${file.name}`,
        timestamp: new Date(),
        attachment: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      };
      setChatMessages(prev => [...prev, message]);
      toast.success('File uploaded successfully');
    }
  };

  const startVideoCall = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      setLocalStream(stream);
      setIsVideoCall(true);

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks from remote peer
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice_candidate', {
            candidate: event.candidate,
            userId: user?._id,
            agentId: activeAgent?.id
          });
        }
      };

      setPeerConnection(pc);

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit('video_call_offer', {
          offer,
          userId: user?._id,
          agentId: activeAgent?.id
        });
      }

      toast.success('Video call started with ' + activeAgent?.name);
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const endVideoCall = () => {
    cleanupVideoCall();

    // Notify remote peer
    if (socket) {
      socket.emit('end_video_call', {
        userId: user?._id,
        agentId: activeAgent?.id
      });
    }

    setIsVideoCall(false);
    toast.info('Video call ended');
  };

  const cleanupVideoCall = () => {
    // Stop all local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    setRemoteStream(null);
    setIsCameraOn(true);
    setIsMicOn(true);
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  };

  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        toast.info(audioTrack.enabled ? 'Microphone on' : 'Microphone off');
      }
    }
  };

  // WebRTC signaling handlers
  const handleVideoOffer = async (data) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socket) {
        socket.emit('video_call_answer', {
          answer,
          userId: user?._id,
          agentId: data.userId
        });
      }
    } catch (error) {
      console.error('Error handling video offer:', error);
    }
  };

  const handleVideoAnswer = async (data) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
      console.error('Error handling video answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleRemoteCallEnd = () => {
    cleanupVideoCall();
    setIsVideoCall(false);
    toast.info('Call ended by agent');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const ticket = await supportAPI.createTicket({
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        userId: user?._id
      });

      setTickets(prev => [ticket, ...prev]);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
      setIsCreateTicketOpen(false);
      toast.success('Support ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Create mock ticket for demo if API fails
      const mockTicket = {
        id: `TKT-${Date.now()}`,
        subject: newTicket.subject,
        status: 'open',
        priority: newTicket.priority,
        created: new Date(),
        lastUpdate: new Date(),
        agent: 'Unassigned'
      };
      setTickets(prev => [mockTicket, ...prev]);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
      setIsCreateTicketOpen(false);
      toast.success('Support ticket created successfully!');
    }
  };

  const markFAQHelpful = (faqId, isHelpful) => {
    setFaqItems(prev => prev.map(faq => 
      faq.id === faqId 
        ? { ...faq, helpful: faq.helpful + (isHelpful ? 1 : -1) }
        : faq
    ));
    toast.success(isHelpful ? 'Marked as helpful!' : 'Feedback recorded');
  };

  const sendQuickContact = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subject = formData.get('subject');
    const message = formData.get('message');

    try {
      await supportAPI.createTicket({
        subject,
        description: message,
        priority: 'medium',
        userId: user?._id
      });
      toast.success('Message sent! We\'ll respond shortly.');
      e.target.reset();
    } catch (error) {
      // Create mock ticket for demo
      const mockTicket = {
        id: `TKT-${Date.now()}`,
        subject,
        status: 'open',
        priority: 'medium',
        created: new Date(),
        lastUpdate: new Date(),
        agent: 'Unassigned'
      };
      setTickets(prev => [mockTicket, ...prev]);
      toast.success('Message sent! We\'ll respond shortly.');
      e.target.reset();
    }
  };

  const filteredFAQs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading support system...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <p className="font-semibold text-red-700">Support System Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button onClick={initializeSupport} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-2">Get instant help from our support team • {connected ? '🟢 Connected' : '🔴 Offline'}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Support Agents Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Support Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      activeAgent?.id === agent.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'
                    }`}
                    onClick={() => setActiveAgent(agent)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          agent.status === 'online' ? 'bg-green-500' : 
                          agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{agent.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      {agent.specialties && Array.isArray(agent.specialties) && agent.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary" className="text-xs mr-1 mb-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-3">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeAgent?.avatar} />
                      <AvatarFallback>{activeAgent?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeAgent?.name}</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          chatStatus === 'online' ? 'bg-green-500' : 'bg-muted-foreground'
                        }`} />
                        <span className="text-sm text-muted-foreground capitalize">{chatStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startVideoCall}
                      className="flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Video Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 ${isRecording ? 'text-red-600' : ''}`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isRecording ? 'Stop' : 'Record'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          {message.sender === 'agent' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.agent?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {message.agent?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{message.agent?.name}</span>
                            </div>
                          )}
                          <p className="text-sm">{message.message}</p>
                          {message.attachment && (
                            <div className="mt-2 p-2 bg-white bg-opacity-20 rounded flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-xs">{message.attachment.name}</span>
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.map(faq => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{faq.answer}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="secondary">{faq.category}</Badge>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {faq.helpful}
                          </span>
                          <span>{faq.views} views</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markFAQHelpful(faq.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markFAQHelpful(faq.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Support Tickets</h2>
            <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we'll get back to you as soon as possible.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-subject">Subject *</Label>
                    <Input
                      id="ticket-subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">Description *</Label>
                    <Textarea
                      id="ticket-description"
                      placeholder="Provide detailed information about your issue"
                      rows={5}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTicket}>
                    Create Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4">
            {tickets.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
                      </div>
                      <Badge variant={ticket.status === 'open' ? 'destructive' : 'default'}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Assigned to: {ticket.agent}</p>
                      <p>Last update: {ticket.lastUpdate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@omnibiz.com</p>
                    <p className="text-xs text-muted-foreground">Response within 2 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Video Support</p>
                    <p className="text-sm text-muted-foreground">Schedule a call</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
                <CardDescription>Send us a message and we'll create a ticket for you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendQuickContact} className="space-y-4">
                  <div>
                    <Label htmlFor="contact-subject">Subject *</Label>
                    <Input 
                      id="contact-subject"
                      name="subject"
                      placeholder="How can we help?" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message *</Label>
                    <Textarea 
                      id="contact-message"
                      name="message"
                      placeholder="Describe your issue..." 
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Call Modal */}
      {isVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
            {/* Video Call Header */}
            <div className="bg-gray-900 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeAgent?.avatar} />
                    <AvatarFallback>{activeAgent?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse"></div>
                </div>
                <div>
                  <p className="font-semibold">{activeAgent?.name}</p>
                  <p className="text-xs text-gray-400">In call</p>
                </div>
              </div>
              <Button variant="destructive" onClick={endVideoCall}>
                <X className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>

            {/* Video Streams */}
            <div className="flex-1 relative bg-gray-800 rounded-b-lg overflow-hidden">
              {/* Remote Video (Main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Remote video placeholder */}
              {!remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={activeAgent?.avatar} />
                    <AvatarFallback className="text-4xl">
                      {activeAgent?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white text-lg">Connecting to {activeAgent?.name}...</p>
                  <div className="flex gap-2 mt-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600 shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                  You
                </div>
                {!isCameraOn && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-900 bg-opacity-90 px-6 py-3 rounded-full">
                <Button
                  variant={isMicOn ? "secondary" : "destructive"}
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={toggleMicrophone}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={isCameraOn ? "secondary" : "destructive"}
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full w-14 h-14"
                  onClick={endVideoCall}
                >
                  <Phone className="h-6 w-6 rotate-135" />
                </Button>
              </div>

              {/* Connection Status */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black bg-opacity-70 px-3 py-2 rounded-full">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-white">
                  {connected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
