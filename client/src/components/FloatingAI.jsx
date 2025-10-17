import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, X, Minimize2, Maximize2, Loader2, Sparkles, Brain, History, Download, Archive, Trash2, Search, MessageCircle, User as UserIcon, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function FloatingAI() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your AI assistant powered by Google Gemini. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [contextData, setContextData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const conversationHistoryRef = useRef([]);

  // Don't render if user is not logged in
  if (!isAuthenticated || !user) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        
        const context = {
          currentPage,
          userName: user?.name || 'User',
          userRole: user?.role || 'Admin',
          businessName: user?.businessName || '',
          timestamp: new Date().toISOString(),
        };
        
        // Get page-specific context
        if (token) {
          try {
            const headers = { Authorization: `Bearer ${token}` };
            
            if (currentPage === 'analytics' || currentPage === 'dashboard') {
              const [orders, products] = await Promise.allSettled([
                api.get('/orders', { headers }),
                api.get('/products', { headers })
              ]);
              
              context.totalOrders = orders.status === 'fulfilled' ? orders.value?.data?.length : 0;
              context.productsCount = products.status === 'fulfilled' ? products.value?.data?.length : 0;
            }
          } catch (error) {
            // Silent fail for context gathering
          }
        }
        
        setContextData(context);
        generateSuggestions(context);
      } catch (error) {
        console.error('Error gathering context:', error);
      }
    };
    
    gatherContext();
  }, [location.pathname, user]);

  // Generate context-aware suggestions
  const generateSuggestions = (context) => {
    const newSuggestions = [];
    const page = context.currentPage;
    
    if (page === 'dashboard') {
      newSuggestions.push("Show me today's sales", "Top products?", "Inventory alerts");
    } else if (page === 'analytics') {
      newSuggestions.push("Analyze sales trends", "Compare periods", "Key insights");
    } else if (page === 'inventory' || page === 'products') {
      newSuggestions.push("Low stock items", "Reorder suggestions", "Inventory turnover");
    } else if (page === 'wallet') {
      newSuggestions.push("Spending patterns", "Account balance", "Cost optimization");
    } else {
      newSuggestions.push("Navigate dashboard", "What can you do?", "Show metrics");
    }
    
    setSuggestions(newSuggestions);
  };

  // Load conversation history
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_conversation_history');
    if (savedHistory) {
      try {
        setConversationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  const handleSend = async (quickMessage = null) => {
    const messageText = quickMessage || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Store in conversation history for learning
    conversationHistoryRef.current.push({
      role: 'user',
      content: messageText,
      context: contextData,
      timestamp: new Date()
    });

    // Store interaction for learning
    try {
      const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
      trainingData.push({
        query: messageText.toLowerCase(),
        context: { page: contextData.currentPage, userRole: contextData.userRole },
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('aiTrainingData', JSON.stringify(trainingData.slice(-100)));
    } catch (e) {
      // Silent fail
    }

    try {
      const { data } = await api.post('/ai/chat', {
        message: messageText,
        context: contextData,
        history: conversationHistoryRef.current.slice(-10),
        systemPrompt: `You are an AI assistant for OmniBiz. User: ${contextData.userName} (${contextData.userRole}), Page: ${contextData.currentPage}. Provide clear, professional responses.`
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Store AI response in history
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: new Date()
      });
      
      if (!isOpen) setHasNewMessage(true);
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback response
      const fallbackResponse = getFallbackResponse(messageText, contextData);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Intelligent fallback responses
  const getFallbackResponse = (message, context) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.match(/^(hi|hello|hey)/)) {
      return `Hello ${context.userName}! I'm your AI assistant. How can I help you today?`;
    }
    if (lowerMsg.includes('sales') || lowerMsg.includes('revenue')) {
      return `You have ${context.totalOrders || 0} orders. Check the Analytics page for detailed sales insights.`;
    }
    if (lowerMsg.includes('inventory') || lowerMsg.includes('stock') || lowerMsg.includes('product')) {
      return `You have ${context.productsCount || 0} products. Visit the Inventory page for stock levels and alerts.`;
    }
    if (lowerMsg.includes('help')) {
      return `I can help with analytics, inventory management, navigation, and business insights. You're on the ${context.currentPage} page. What would you like to know?`;
    }
    return `I'm processing your question about "${message}". You're on the ${context.currentPage} page. ${suggestions[0] ? `Try: "${suggestions[0]}"` : 'How can I assist you?'}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // History management functions
  const saveToHistory = () => {
    const historyEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      messages: messages,
      context: contextData,
      summary: messages.length > 1 ? messages[1].content.substring(0, 50) + '...' : 'New conversation'
    };

    const updatedHistory = [historyEntry, ...conversationHistory].slice(0, 50);
    setConversationHistory(updatedHistory);
    localStorage.setItem('ai_conversation_history', JSON.stringify(updatedHistory));
    toast.success('Conversation saved');
  };

  const exportConversation = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnibiz-ai-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  const clearConversation = () => {
    if (window.confirm('Clear this conversation?')) {
      setMessages([{
        id: 1,
        role: 'assistant',
        content: `Hello ${user?.name}! How can I help you?`,
        timestamp: new Date()
      }]);
      conversationHistoryRef.current = [];
      toast.success('Cleared');
    }
  };

  const deleteHistoryEntry = (id) => {
    const updated = conversationHistory.filter(entry => entry.id !== id);
    setConversationHistory(updated);
    localStorage.setItem('ai_conversation_history', JSON.stringify(updated));
    toast.success('Deleted');
  };

  const loadHistoryEntry = (entry) => {
    setMessages(entry.messages);
    setShowHistory(false);
    toast.success('Loaded');
  };

  const filteredHistory = conversationHistory.filter(entry =>
    entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true);
            setHasNewMessage(false);
          }}
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110",
            "bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 relative animate-gradient-x"
          )}
          size="icon"
        >
          {hasNewMessage && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center animate-bounce">
              1
            </Badge>
          )}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-ping"></div>
          <MessageCircle className="h-7 w-7 relative z-10" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" onClick={() => setIsOpen(false)} />
      
      <Card className={cn(
        "shadow-2xl border-2 border-primary/30 flex flex-col overflow-hidden backdrop-blur-md bg-card/95 animate-in slide-in-from-bottom-5 duration-300",
        isMinimized ? "w-80 h-16" : "w-80 sm:w-96 h-[600px]"
      )}>
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 text-primary-foreground p-4 shadow-lg">
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
                  OmniBiz AI
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                </p>
                <p className="text-xs opacity-90">
                  {isLoading ? "Thinking..." : "Online • Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" title="History">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={exportConversation} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" title="Export">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={saveToHistory} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" title="Save">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={clearConversation} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8" title="Clear">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20 hover:rotate-90 transition-all h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Learning Badge */}
          {!isMinimized && conversationHistoryRef.current.length > 2 && (
            <div className="relative mt-2 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                <Brain className="h-3 w-3 mr-1" />
                Learning Mode • {conversationHistoryRef.current.length} interactions
              </Badge>
            </div>
          )}
        </div>

        {!isMinimized && (
          <>
            {/* History Panel */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="h-8 text-sm" />
                </div>
                {filteredHistory.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No history yet</p>
                  </div>
                ) : (
                  filteredHistory.map((entry) => (
                    <div key={entry.id} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group" onClick={() => loadHistoryEntry(entry)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">{entry.summary}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(entry.date).toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs mt-1">{entry.messages.length} messages</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                {/* Messages with Avatars */}
                <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-accent/5 to-transparent">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={message.id} className={cn("flex gap-2 items-end animate-in slide-in-from-bottom-3", message.role === 'user' ? 'justify-end' : 'justify-start')} style={{ animationDelay: `${index * 50}ms` }}>
                        {message.role === 'assistant' && (
                          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border-2 border-accent">
                            <Bot className="h-5 w-5 text-accent" />
                          </div>
                        )}
                        <div className={cn("max-w-[75%] rounded-2xl p-3 shadow-md transition-all hover:shadow-lg", message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border-2 border-accent/30 text-foreground rounded-bl-sm")}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1.5">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-primary">
                            <UserIcon className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isLoading && (
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
                </ScrollArea>

                {/* Context-Aware Suggestions */}
                {suggestions.length > 0 && messages.length <= 2 && (
                  <div className="px-4 pb-2 border-t border-border/50 bg-gradient-to-b from-accent/5 to-transparent">
                    <div className="flex items-center gap-2 mb-2 mt-3">
                      <Lightbulb className="h-4 w-4 text-accent animate-pulse" />
                      <p className="text-xs font-medium text-accent">Suggested for {contextData.currentPage}:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handleSend(suggestion)} className="text-xs hover:bg-accent/10 hover:border-accent transition-all">
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input with Context Indicators */}
                <div className="p-4 border-t-2 border-border bg-card/50 backdrop-blur-sm">
                  {/* Context Indicator */}
                  {contextData.currentPage && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Brain className="h-3 w-3 text-accent animate-pulse" />
                      <span>Context: {contextData.currentPage} page</span>
                      {contextData.totalOrders > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{contextData.totalOrders} orders</Badge>
                      )}
                      {conversationHistoryRef.current.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          <TrendingUp className="h-3 w-3 mr-1" />Learning
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything about your business..." disabled={isLoading} className="flex-1 border-2 border-input focus:border-primary transition-all bg-background/50 backdrop-blur-sm" />
                    <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} size="icon" className={cn("h-10 w-10 transition-all duration-200", input.trim() && "hover:scale-110 shadow-lg shadow-primary/50 bg-gradient-to-r from-blue-500 to-purple-600")}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Powered by Google Gemini AI • Press Enter to send
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
