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
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const HelpSupport = () => {
  const { user } = useAuth();
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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeSupport();
    loadFAQs();
    loadTickets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const initializeSupport = () => {
    // Mock support agents
    const agents = [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Senior Support Specialist',
        avatar: '/api/placeholder/40/40',
        status: 'online',
        rating: 4.9,
        specialties: ['Technical Issues', 'Account Management']
      },
      {
        id: 2,
        name: 'Mike Chen',
        role: 'Technical Support',
        avatar: '/api/placeholder/40/40',
        status: 'online',
        rating: 4.8,
        specialties: ['API Integration', 'Billing']
      },
      {
        id: 3,
        name: 'Emma Davis',
        role: 'Customer Success',
        avatar: '/api/placeholder/40/40',
        status: 'busy',
        rating: 4.9,
        specialties: ['Onboarding', 'Training']
      }
    ];
    setSupportAgents(agents);
    setActiveAgent(agents[0]);
    setChatStatus('online');

    // Initialize chat with welcome message
    setChatMessages([
      {
        id: 1,
        sender: 'agent',
        message: `Hi ${user?.name || 'there'}! I'm Sarah, your support specialist. How can I help you today?`,
        timestamp: new Date(),
        agent: agents[0]
      }
    ]);
  };

  const loadFAQs = () => {
    const faqs = [
      {
        id: 1,
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on "Forgot Password" on the login page...',
        category: 'Account',
        helpful: 45,
        views: 234
      },
      {
        id: 2,
        question: 'How to integrate with third-party APIs?',
        answer: 'Our API integration guide provides step-by-step instructions...',
        category: 'Technical',
        helpful: 38,
        views: 189
      },
      {
        id: 3,
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and bank transfers...',
        category: 'Billing',
        helpful: 52,
        views: 312
      }
    ];
    setFaqItems(faqs);
  };

  const loadTickets = () => {
    const mockTickets = [
      {
        id: 'TKT-001',
        subject: 'API Integration Issue',
        status: 'open',
        priority: 'high',
        created: new Date(Date.now() - 86400000),
        lastUpdate: new Date(Date.now() - 3600000),
        agent: 'Mike Chen'
      },
      {
        id: 'TKT-002',
        subject: 'Billing Question',
        status: 'resolved',
        priority: 'medium',
        created: new Date(Date.now() - 172800000),
        lastUpdate: new Date(Date.now() - 7200000),
        agent: 'Sarah Johnson'
      }
    ];
    setTickets(mockTickets);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: Date.now() + 1,
        sender: 'agent',
        message: generateAgentResponse(newMessage),
        timestamp: new Date(),
        agent: activeAgent
      };
      setChatMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 2000);
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

  const startVideoCall = () => {
    setIsVideoCall(true);
    toast.success('Video call started with ' + activeAgent?.name);
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
    toast.info('Video call ended');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const filteredFAQs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Get instant help from our support team</p>
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
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeAgent?.id === agent.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
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
                        <p className="text-xs text-gray-500">{agent.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{agent.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      {agent.specialties.map(specialty => (
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
                          chatStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-600 capitalize">{chatStatus}</span>
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
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
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
                        <div className="bg-gray-100 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                        <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-600 text-sm mb-3">{faq.answer}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Badge variant="secondary">{faq.category}</Badge>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {faq.helpful}
                          </span>
                          <span>{faq.views} views</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
            <Button>Create New Ticket</Button>
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
                    <div className="text-right text-sm text-gray-600">
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
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-xs text-gray-500">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@omnibiz.com</p>
                    <p className="text-xs text-gray-500">Response within 2 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Video Support</p>
                    <p className="text-sm text-gray-600">Schedule a call</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea placeholder="Describe your issue..." rows={4} />
                </div>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Call Modal */}
      {isVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Call with {activeAgent?.name}</CardTitle>
              <Button variant="destructive" onClick={endVideoCall}>
                End Call
              </Button>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">Video call interface would be here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
