import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles, Brain, Lightbulb, TrendingUp, History, Download, Search, Trash2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const LiveChatWidget = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! 👋 I'm your AI assistant powered by advanced machine learning. I can help you with analytics, suggestions, and navigate through your business dashboard. What would you like to know?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [contextData, setContextData] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Store conversation history for learning
  const conversationHistoryRef = useRef([]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Gather application context
  useEffect(() => {
    const gatherContext = async () => {
      try {
        const currentPage = location.pathname.split('/').pop() || 'dashboard';
        const token = localStorage.getItem('token');
        
        // Fetch relevant data based on current page
        const context = {
          currentPage,
          userName: user?.name || 'User',
          userRole: user?.role || 'Admin',
          timestamp: new Date().toISOString(),
          recentActions: JSON.parse(localStorage.getItem('recentActions') || '[]'),
        };
        
        // Get page-specific context
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          
          if (currentPage === 'analytics' || currentPage === 'dashboard') {
            const [orders, inventory] = await Promise.allSettled([
              api.get('/orders', { headers }),
              api.get('/inventory', { headers })
            ]);
            
            context.totalOrders = orders.status === 'fulfilled' ? orders.value?.data?.length : 0;
            context.inventoryCount = inventory.status === 'fulfilled' ? inventory.value?.data?.length : 0;
          }
        }
        
        setContextData(context);
        
        // Generate contextual suggestions
        generateSuggestions(context);
      } catch (error) {
        console.error('Error gathering context:', error);
      }
    };
    
    gatherContext();
  }, [location.pathname, user]);
  
  // Generate intelligent suggestions based on context
  const generateSuggestions = (context) => {
    const newSuggestions = [];
    
    if (context.currentPage === 'dashboard') {
      newSuggestions.push(
        "Show me today's sales summary",
        "What are my top performing products?",
        "Give me inventory alerts"
      );
    } else if (context.currentPage === 'analytics') {
      newSuggestions.push(
        "Analyze my sales trends",
        "Compare this month vs last month",
        "What insights can you provide?"
      );
    } else if (context.currentPage === 'inventory') {
      newSuggestions.push(
        "Show low stock items",
        "Suggest reorder quantities",
        "Analyze inventory turnover"
      );
    } else if (context.currentPage === 'wallet') {
      newSuggestions.push(
        "Show my spending patterns",
        "What's my account balance?",
        "Suggest ways to optimize costs"
      );
    } else {
      newSuggestions.push(
        "Help me navigate the dashboard",
        "What can you help me with?",
        "Show me key metrics"
      );
    }
    
    setSuggestions(newSuggestions);
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);
    
    // Store in conversation history
    conversationHistoryRef.current.push({
      role: 'user',
      content: text,
      context: contextData,
      timestamp: new Date()
    });
    
    // Store recent action
    const recentActions = JSON.parse(localStorage.getItem('recentActions') || '[]');
    recentActions.unshift({ action: 'ai_query', query: text, timestamp: new Date() });
    localStorage.setItem('recentActions', JSON.stringify(recentActions.slice(0, 10)));

    try {
      // Get AI response with context
      const aiResponse = await getAIResponse(text, contextData, conversationHistoryRef.current);
      
      setIsTyping(false);
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "support",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, supportMessage]);
      
      // Store AI response in history
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error) {
      console.error('AI Response Error:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an issue processing your request. However, based on your context, I can suggest: " + suggestions[0],
        sender: "support",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // Advanced AI response function with OpenAI/Gemini integration
  const getAIResponse = async (userMessage, context, history) => {
    try {
      // Try OpenAI API first
      const token = localStorage.getItem('token');
      
      // Build context-aware prompt
      const systemPrompt = `You are an intelligent AI assistant for OmniBiz, a comprehensive business management platform. 
      
Current Context:
- User: ${context.userName} (${context.userRole})
- Current Page: ${context.currentPage}
- Total Orders: ${context.totalOrders || 'N/A'}
- Inventory Items: ${context.inventoryCount || 'N/A'}

You have access to:
- Analytics & Reports
- Inventory Management
- Order Processing
- Financial Data (Wallet)
- Team Management
- AI Insights
- Customer Management

Important guidelines:
- Minimize use of emojis (use sparingly, only when truly necessary)
- Provide clear, professional responses
- Be concise but informative
- Learn from previous interactions
- Greet users warmly
- Answer simple questions naturally
- Provide actionable insights

This is interaction #${history.length + 1} with this user.`;
      
      // Call backend AI endpoint
      const response = await api.post('/ai/chat', {
        message: userMessage,
        context: context,
        history: history.slice(-10), // Last 10 messages for context
        systemPrompt: systemPrompt
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Fallback to intelligent rule-based responses
      return generateIntelligentFallbackResponse(userMessage, context);
    }
  };
  
  // Intelligent fallback response generator with learning
  const generateIntelligentFallbackResponse = (userMessage, context) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Store interaction for learning
    storeInteractionForLearning(userMessage, context);
    
    // Greetings - Expanded
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
      const greetings = [
        `Hello ${context.userName}! I'm your AI assistant for OmniBiz. How can I help you today?`,
        `Hi ${context.userName}! Welcome back. What would you like to know?`,
        `Good to see you ${context.userName}! I'm here to assist with your business needs.`,
        `Hey ${context.userName}! Ready to help you manage your business more efficiently.`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Simple questions
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
      return `I'm functioning well, thank you for asking! I'm here to assist you with your business operations. What can I help you with today?`;
    }
    
    if (lowerMessage.includes('what is your name') || lowerMessage.includes('who are you')) {
      return `I'm OmniBiz AI, your intelligent business assistant. I help you analyze data, navigate the platform, and optimize your business operations. How may I assist you?`;
    }
    
    if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
      return `You're welcome! I'm always here to help. Feel free to ask if you need anything else.`;
    }
    
    // Analytics queries
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
      return `Based on your current data, you have ${context.totalOrders || 0} orders. To view detailed sales analytics, navigate to the Analytics page where you can see trends, top products, and revenue insights. Would you like me to guide you there?`;
    }
    
    // Inventory queries
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return `You currently have ${context.inventoryCount || 0} items in your inventory. I recommend checking the Inventory page for detailed stock levels, low stock alerts, and reorder suggestions. Shall I help you navigate there?`;
    }
    
    // Navigation help
    if (lowerMessage.includes('navigate') || lowerMessage.includes('go to') || lowerMessage.includes('show me')) {
      return `I can help you navigate! Here are the main sections:\n\nDashboard - Overview & KPIs\nAnalytics - Sales & Performance\nInventory - Stock Management\nWallet - Financial Transactions\nTeam - Staff Management\nAI Insights - Intelligent Analysis\n\nWhich section would you like to visit?`;
    }
    
    // Insights & suggestions
    if (lowerMessage.includes('insight') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
      const currentPage = context.currentPage;
      const learningData = getLearnedPatterns();
      
      if (currentPage === 'dashboard') {
        return `Here are some insights for your dashboard:\n\n- Check your Analytics page for trend analysis\n- Review inventory for low stock items\n- Monitor your wallet for expense patterns\n- Use AI Insights for predictive analytics${learningData ? '\n\nBased on your previous interactions, you frequently ask about ' + learningData.topQuery : ''}\n\nWould you like me to elaborate on any of these?`;
      }
      return `Based on your activity on the ${currentPage} page and ${conversationHistoryRef.current.length} previous interactions, I suggest exploring related features and checking the AI Insights section for personalized recommendations.`;
    }
    
    // Help & guidance
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what can you')) {
      return `I'm here to help! I can:\n\n- Answer questions about your business data\n- Provide analytics insights\n- Help navigate the dashboard\n- Suggest optimizations\n- Analyze trends\n- Track finances\n- Learn from our interactions\n\nYou're currently on the ${context.currentPage} page with ${context.totalOrders || 0} orders. What specific information would you like?`;
    }
    
    // Capabilities question
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('your capabilities')) {
      return `I can assist you with:\n\n1. Data Analysis - Review sales, inventory, and financial data\n2. Navigation - Guide you through the platform\n3. Insights - Provide business intelligence\n4. Recommendations - Suggest optimizations\n5. Learning - I adapt to your preferences over time\n\nI've learned from ${conversationHistoryRef.current.length} interactions with you. How can I help today?`;
    }
    
    // Default intelligent response with learning
    const learningInsight = getRelevantLearning(lowerMessage);
    if (learningInsight) {
      return `${learningInsight} You're currently on the ${context.currentPage} page. ${suggestions[0] ? `You might also want to: "${suggestions[0]}"` : 'How else can I assist you?'}`;
    }
    
    return `I understand you're asking about "${userMessage}". While I'm processing your request, I can tell you that you're currently on the ${context.currentPage} page with ${context.totalOrders || 0} total orders. ${suggestions[0] ? `You might find it helpful to: "${suggestions[0]}"` : 'How else can I assist you?'}`;
  };
  
  // Store interaction for learning
  const storeInteractionForLearning = (query, context) => {
    try {
      const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
      trainingData.push({
        query: query.toLowerCase(),
        context: {
          page: context.currentPage,
          timestamp: new Date().toISOString(),
          userRole: context.userRole
        },
        sessionId: localStorage.getItem('sessionId') || Date.now().toString()
      });
      // Keep last 100 interactions
      localStorage.setItem('aiTrainingData', JSON.stringify(trainingData.slice(-100)));
      
      // Update query frequency
      const queryFrequency = JSON.parse(localStorage.getItem('aiQueryFrequency') || '{}');
      const queryKey = query.toLowerCase().substring(0, 50);
      queryFrequency[queryKey] = (queryFrequency[queryKey] || 0) + 1;
      localStorage.setItem('aiQueryFrequency', JSON.stringify(queryFrequency));
    } catch (error) {
      console.error('Learning storage error:', error);
    }
  };
  
  // Get learned patterns
  const getLearnedPatterns = () => {
    try {
      const queryFrequency = JSON.parse(localStorage.getItem('aiQueryFrequency') || '{}');
      const entries = Object.entries(queryFrequency);
      if (entries.length === 0) return null;
      
      // Find most frequent query
      const topQuery = entries.reduce((a, b) => a[1] > b[1] ? a : b);
      return {
        topQuery: topQuery[0],
        count: topQuery[1]
      };
    } catch (error) {
      return null;
    }
  };
  
  // Get relevant learning based on current query
  const getRelevantLearning = (query) => {
    try {
      const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
      const similarQueries = trainingData.filter(item => 
        item.query.includes(query.substring(0, 10)) || 
        query.includes(item.query.substring(0, 10))
      );
      
      if (similarQueries.length > 0) {
        return `Based on ${similarQueries.length} similar previous queries, I can help you with that.`;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Load conversation history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_conversation_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setConversationHistory(parsed);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save conversation to history
  const saveToHistory = () => {
    const historyEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      messages: messages,
      context: contextData,
      summary: messages.length > 1 ? messages[1].text.substring(0, 50) + '...' : 'New conversation'
    };

    const updatedHistory = [historyEntry, ...conversationHistory].slice(0, 50); // Keep last 50 conversations
    setConversationHistory(updatedHistory);
    localStorage.setItem('ai_conversation_history', JSON.stringify(updatedHistory));
  };

  // Export conversation as JSON
  const exportConversation = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnibiz-ai-chat-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear current conversation
  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([{
        id: "1",
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "support",
        timestamp: new Date(),
      }]);
    }
  };

  // Delete history entry
  const deleteHistoryEntry = (id) => {
    const updated = conversationHistory.filter(entry => entry.id !== id);
    setConversationHistory(updated);
    localStorage.setItem('ai_conversation_history', JSON.stringify(updated));
  };

  // Load history entry
  const loadHistoryEntry = (entry) => {
    setMessages(entry.messages);
    setShowHistory(false);
  };

  // Search conversations
  const filteredHistory = conversationHistory.filter(entry =>
    entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  return (
    <>
      {/* Floating Toggle Button with Animation */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleOpen}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110",
              "bg-gradient-to-r from-primary to-accent animate-pulse-slow relative"
            )}
            size="icon"
          >
            {/* Notification Badge */}
            {hasNewMessage && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center animate-bounce"
              >
                1
              </Badge>
            )}
            
            {/* Sparkle Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping"></div>
            
            <MessageCircle className="h-7 w-7 relative z-10" />
          </Button>
        </div>
      )}

      {/* Chat Window with Enhanced Visibility */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="w-80 sm:w-96 h-[550px] shadow-2xl border-2 border-primary/30 flex flex-col overflow-hidden backdrop-blur-md bg-card/95 animate-in slide-in-from-bottom-5 duration-300">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground p-4 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary animate-pulse"></div>
                  </div>
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2">
                      AI Assistant
                      <Sparkles className="h-4 w-4 animate-spin-slow" />
                    </p>
                    <p className="text-xs opacity-90">
                      {isTyping ? "Typing..." : "Online • Ready to help"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Conversation History"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exportConversation}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Export Conversation"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={saveToHistory}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Save to History"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearConversation}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Clear Conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-primary-foreground hover:bg-primary-foreground/20 hover:rotate-90 transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Learning Badge */}
              {conversationHistoryRef.current.length > 2 && (
                <div className="relative mt-2 flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                    <Brain className="h-3 w-3 mr-1" />
                    Learning Mode • {conversationHistoryRef.current.length} interactions
                  </Badge>
                </div>
              )}
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="h-8 text-sm"
                  />
                </div>
                
                {filteredHistory.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversation history yet</p>
                    <p className="text-xs mt-1">Start chatting to build your history</p>
                  </div>
                ) : (
                  filteredHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                      onClick={() => loadHistoryEntry(entry)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{entry.summary}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.date).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {entry.messages.length} messages
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryEntry(entry.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages Area with Better Visibility */}
            {!showHistory && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-accent/5 to-transparent">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 items-end animate-in slide-in-from-bottom-3",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar for support messages */}
                  {message.sender === "support" && (
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border-2 border-accent">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl p-3 shadow-md transition-all duration-200 hover:shadow-lg",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border-2 border-accent/30 text-foreground rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1.5 flex items-center gap-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  
                  {/* Avatar for user messages */}
                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-primary">
                      <UserIcon className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 items-end animate-in fade-in duration-300">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border-2 border-accent">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  <div className="bg-card border-2 border-accent/30 rounded-2xl rounded-bl-sm p-3 flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            )}

            {/* AI Suggestions */}
            {!showHistory && suggestions.length > 0 && messages.length <= 2 && (
              <div className="px-4 pb-2 border-t border-border/50 bg-gradient-to-b from-accent/5 to-transparent">
                <div className="flex items-center gap-2 mb-2 mt-3">
                  <Lightbulb className="h-4 w-4 text-accent animate-pulse" />
                  <p className="text-xs font-medium text-accent">Suggested questions:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-xs hover:bg-accent/10 hover:border-accent transition-all"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Input Area */}
            <div className="p-4 border-t-2 border-border bg-card/50 backdrop-blur-sm">
              {/* Context Indicator */}
              {contextData.currentPage && (
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Brain className="h-3 w-3 text-accent animate-pulse" />
                  <span>Context: {contextData.currentPage} page</span>
                  {contextData.totalOrders > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {contextData.totalOrders} orders
                    </Badge>
                  )}
                  {conversationHistoryRef.current.length > 2 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Learning
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything about your business..."
                  className="flex-1 border-2 border-input focus:border-primary transition-all bg-background/50 backdrop-blur-sm allow-select"
                />
                <Button 
                  onClick={() => handleSendMessage()} 
                  size="icon"
                  disabled={!inputValue.trim()}
                  className={cn(
                    "h-10 w-10 transition-all duration-200",
                    inputValue.trim() && "hover:scale-110 shadow-lg shadow-primary/50"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by AI • Press Enter to send
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;