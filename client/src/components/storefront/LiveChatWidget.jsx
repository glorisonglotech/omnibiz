import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle, X, Send, Bot, User as UserIcon, Sparkles, Brain,
  Lightbulb, TrendingUp, History, Download, Search, Trash2, Archive,
  Mic, MicOff, Paperclip, Settings, Maximize2, Minimize2, Star,
  ShoppingCart, TrendingDown, Package, DollarSign, Users, Zap,
  BarChart3, RefreshCw, Copy, ThumbsUp, ThumbsDown, AlertCircle,
  Phone, Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import CallDialog from "@/components/CallDialog";
import api from "@/lib/api";

const LiveChatWidget = () => {
  const location = useLocation();
  const { inviteCode } = useParams();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dashboardType, setDashboardType] = useState('admin'); // 'admin' or 'storefront'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [contextData, setContextData] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('professional'); // professional, friendly, technical
  const [trainingEnabled, setTrainingEnabled] = useState(true);
  const [realTimeData, setRealTimeData] = useState({});
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [businessOwner, setBusinessOwner] = useState(null); // Store business owner info for calls
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Store conversation history for learning
  const conversationHistoryRef = useRef([]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Detect dashboard type (admin vs storefront)
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('storefront') || path.includes('client')) {
      setDashboardType('storefront');
    } else {
      setDashboardType('admin');
    }
  }, [location.pathname]);

  // Initialize welcome message based on dashboard type
  useEffect(() => {
    const getWelcomeMessage = () => {
      if (dashboardType === 'storefront') {
        return {
          id: "1",
          text: `Welcome to our store! 🛍️ I'm your shopping assistant. I can help you find products, track your orders, book appointments, and answer any questions about our services. How can I assist you today?`,
          sender: "support",
          timestamp: new Date(),
        };
      } else {
        return {
          id: "1",
          text: `Hello ${user?.name || 'there'}! 👋 I'm your ominbiz AI Assistant, powered by advanced machine learning. I can help with analytics, inventory insights, sales trends, financial data, and much more. What would you like to explore?`,
          sender: "support",
          timestamp: new Date(),
        };
      }
    };

    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [dashboardType, user, messages.length]);

  // Gather comprehensive application context with real-time data
  useEffect(() => {
    const gatherContext = async () => {
      try {
        const currentPage = location.pathname.split('/').pop() || 'dashboard';
        const adminToken = localStorage.getItem('token');
        const customerToken = localStorage.getItem('customerToken');
        
        // Base context
        const context = {
          currentPage,
          userName: user?.name || 'User',
          userRole: user?.role || (dashboardType === 'storefront' ? 'Customer' : 'Admin'),
          dashboardType,
          timestamp: new Date().toISOString(),
          recentActions: JSON.parse(localStorage.getItem('recentActions') || '[]'),
          aiPersonality,
        };
        
        // Get comprehensive data for admin dashboard
        if (adminToken && dashboardType === 'admin') {
          const headers = { Authorization: `Bearer ${adminToken}` };
          
          try {
            const [orders, products, transactions, appointments] = await Promise.allSettled([
              api.get('/orders', { headers }),
              api.get('/products', { headers }),
              api.get('/transactions', { headers }),
              api.get('/appointments', { headers })
            ]);
            
            const ordersData = orders.status === 'fulfilled' ? orders.value?.data || [] : [];
            const productsData = products.status === 'fulfilled' ? products.value?.data || [] : [];
            const transactionsData = transactions.status === 'fulfilled' ? transactions.value?.data || [] : [];
            const appointmentsData = appointments.status === 'fulfilled' ? appointments.value?.data || [] : [];
            
            context.totalOrders = ordersData.length;
            context.totalProducts = productsData.length;
            context.totalRevenue = Array.isArray(transactionsData) 
              ? transactionsData.reduce((sum, t) => sum + (t.amount || 0), 0)
              : 0;
            context.pendingOrders = ordersData.filter(o => o.status === 'pending').length;
            context.lowStockItems = productsData.filter(p => p.stock < 10).length;
            context.upcomingAppointments = appointmentsData.filter(a => new Date(a.date) > new Date()).length;
            
            setRealTimeData(context);
          } catch (error) {
            console.error('Error fetching admin data:', error);
          }
        } 
        // Get storefront-specific data (use customerToken for authenticated customers)
        else if (dashboardType === 'storefront' && inviteCode) {
          try {
            const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
            
            const [products, orders] = await Promise.allSettled([
              api.get('/public/products', { params: { inviteCode } }),
              customerToken ? api.get('/customer/orders', { headers }) : Promise.resolve({ status: 'rejected' })
            ]);
            
            context.availableProducts = products.status === 'fulfilled' ? products.value?.data?.length || 0 : 0;
            context.myOrders = orders.status === 'fulfilled' ? orders.value?.data?.orders?.length || 0 : 0;
          } catch (error) {
            console.error('Error fetching storefront data:', error);
          }
        }
        
        setContextData(context);
        
        // Generate contextual suggestions
        generateSuggestions(context);
        
        // Store context for training
        if (trainingEnabled) {
          storeContextForTraining(context);
        }
      } catch (error) {
        console.error('Error gathering context:', error);
      }
    };
    
    gatherContext();
    
    // Refresh context every 30 seconds for real-time data
    const interval = setInterval(gatherContext, 30000);
    return () => clearInterval(interval);
  }, [location.pathname, user, dashboardType, aiPersonality, trainingEnabled, inviteCode]);
  
  // Generate intelligent suggestions based on context and dashboard type
  const generateSuggestions = (context) => {
    const newSuggestions = [];
    
    if (context.dashboardType === 'storefront') {
      // Customer/Storefront suggestions
      if (context.currentPage === 'storefront' || context.currentPage === 'products') {
        newSuggestions.push(
          "Show me popular products",
          "What's on sale today?",
          "Help me find a specific item"
        );
      } else if (context.currentPage === 'appointments' || context.currentPage === 'book') {
        newSuggestions.push(
          "Book an appointment",
          "Check my booking status",
          "What services are available?"
        );
      } else if (context.currentPage.includes('order')) {
        newSuggestions.push(
          "Track my order",
          "View my order history",
          "What's my delivery status?"
        );
      } else {
        newSuggestions.push(
          "Browse products",
          "Check store hours",
          "How can I contact support?"
        );
      }
    } else {
      // Admin dashboard suggestions
      if (context.currentPage === 'dashboard') {
        newSuggestions.push(
          "Show today's sales summary",
          "Top performing products?",
          context.lowStockItems > 0 ? `${context.lowStockItems} items need restocking` : "Check inventory status"
        );
      } else if (context.currentPage === 'analytics') {
        newSuggestions.push(
          "Analyze sales trends",
          "Compare monthly performance",
          "Predict next month's revenue"
        );
      } else if (context.currentPage === 'inventory' || context.currentPage === 'products') {
        newSuggestions.push(
          "Show low stock alerts",
          "Suggest reorder quantities",
          "Analyze inventory turnover"
        );
      } else if (context.currentPage === 'wallet' || context.currentPage === 'finances') {
        newSuggestions.push(
          "Show spending patterns",
          "Revenue breakdown",
          "Cost optimization tips"
        );
      } else if (context.currentPage === 'team') {
        newSuggestions.push(
          "Team performance metrics",
          "Schedule management",
          "Add new team member"
        );
      } else {
        newSuggestions.push(
          "Navigate dashboard",
          "Show key metrics",
          "Business insights"
        );
      }
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
  
  // Advanced AI response function with Gemini integration and dashboard-specific training
  const getAIResponse = async (userMessage, context, history) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
      
      // Build dashboard-specific context-aware prompt
      const systemPrompt = buildDashboardSpecificPrompt(context, history);
      
      // Prepare enriched context with real-time data
      const enrichedContext = {
        ...context,
        ...realTimeData,
        conversationCount: history.length,
        personality: aiPersonality,
        previousQueries: getRecentQueries(5),
      };
      
      // Call backend Gemini AI endpoint with increased timeout and better error handling
      const response = await api.post('/ai/chat', {
        message: userMessage,
        context: enrichedContext,
        history: history.slice(-10), // Last 10 messages for context
        systemPrompt: systemPrompt,
        dashboardType: dashboardType // Admin or storefront context
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 30000 // 30 second timeout
      });
      
      // Store successful AI interaction for training
      if (trainingEnabled && response.data.response) {
        storeAIInteractionForTraining(userMessage, response.data.response, context);
      }
      
      return response.data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      
      // If AI service is unavailable, return fallback immediately
      if (error.response?.status === 503 || error.response?.status === 500) {
        console.log('AI service unavailable, using intelligent fallback');
      }
      
      // Fallback to intelligent rule-based responses
      return generateIntelligentFallbackResponse(userMessage, context);
    }
  };

  // Build dashboard-specific system prompt
  const buildDashboardSpecificPrompt = (context, history) => {
    const basePrompt = `You are an intelligent AI assistant for ominbiz, powered by Google Gemini AI.`;
    
    if (context.dashboardType === 'storefront') {
      return `${basePrompt}

You are assisting a CUSTOMER on the storefront:
- User: ${context.userName}
- Role: Customer/Shopper
- Current Page: ${context.currentPage}
- Available Products: ${context.availableProducts || 'N/A'}
- Their Orders: ${context.myOrders || 0}

Your capabilities:
- Help find and recommend products
- Track orders and deliveries
- Book appointments/services
- Answer questions about products and services
- Provide shopping assistance

Tone: ${aiPersonality === 'friendly' ? 'Warm, friendly, and helpful' : aiPersonality === 'professional' ? 'Professional but approachable' : 'Clear and informative'}
- Be customer-focused and sales-oriented
- Recommend products when relevant
- Make shopping easy and enjoyable
- Use emojis sparingly for a friendly touch

This is interaction #${history.length + 1}.`;
    } else {
      return `${basePrompt}

You are assisting a BUSINESS ADMIN/MANAGER:
- User: ${context.userName} (${context.userRole})
- Dashboard: Admin/Business Management
- Current Page: ${context.currentPage}

Real-time Business Metrics:
- Total Orders: ${context.totalOrders || 0}
- Total Products: ${context.totalProducts || 0}
- Total Revenue: $${context.totalRevenue || 0}
- Pending Orders: ${context.pendingOrders || 0}
- Low Stock Items: ${context.lowStockItems || 0}
- Upcoming Appointments: ${context.upcomingAppointments || 0}

You have access to:
- Analytics & Sales Reports
- Inventory Management
- Order Processing
- Financial Data & Wallet
- Team Management
- AI-powered Insights
- Customer Management

Tone: ${aiPersonality === 'technical' ? 'Technical and data-focused' : aiPersonality === 'professional' ? 'Professional and analytical' : 'Clear and actionable'}
- Provide data-driven insights
- Offer actionable business recommendations
- Focus on efficiency and growth
- Be concise but comprehensive
- Use business terminology

This is interaction #${history.length + 1} with this user.`;
    }
  };

  // Store context for training
  const storeContextForTraining = useCallback((context) => {
    try {
      const trainingContexts = JSON.parse(localStorage.getItem('aiTrainingContexts') || '[]');
      trainingContexts.push({
        ...context,
        timestamp: new Date().toISOString(),
        sessionId: localStorage.getItem('sessionId') || Date.now().toString()
      });
      localStorage.setItem('aiTrainingContexts', JSON.stringify(trainingContexts.slice(-200)));
    } catch (error) {
      console.error('Context storage error:', error);
    }
  }, []);

  // Store AI interaction for training
  const storeAIInteractionForTraining = (question, answer, context) => {
    try {
      const interactions = JSON.parse(localStorage.getItem('aiSuccessfulInteractions') || '[]');
      interactions.push({
        question,
        answer,
        context: {
          page: context.currentPage,
          dashboardType: context.dashboardType,
          userRole: context.userRole
        },
        timestamp: new Date().toISOString(),
        rating: null // Can be rated later
      });
      localStorage.setItem('aiSuccessfulInteractions', JSON.stringify(interactions.slice(-500)));
    } catch (error) {
      console.error('Interaction storage error:', error);
    }
  };

  // Get recent queries for context
  const getRecentQueries = (count = 5) => {
    try {
      const trainingData = JSON.parse(localStorage.getItem('aiTrainingData') || '[]');
      return trainingData.slice(-count).map(item => item.query);
    } catch (error) {
      return [];
    }
  };
  
  // Intelligent fallback response generator with learning and dashboard awareness
  const generateIntelligentFallbackResponse = (userMessage, context) => {
    const lowerMessage = userMessage.toLowerCase();
    const isStorefront = context.dashboardType === 'storefront';
    
    // Store interaction for learning
    storeInteractionForLearning(userMessage, context);
    
    // Greetings - Dashboard-specific
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
      if (isStorefront) {
        const greetings = [
          `Hello! Welcome to our store. How can I help you find what you're looking for today?`,
          `Hi there! I'm here to make your shopping experience amazing. What can I help you with?`,
          `Hey! Thanks for visiting. Need help finding products or tracking an order?`,
          `Good day! I'm your shopping assistant. How may I assist you?`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
      } else {
        const greetings = [
          `Hello ${context.userName}! Ready to dive into your business metrics. What would you like to explore?`,
          `Hi ${context.userName}! Your dashboard shows ${context.totalOrders || 0} orders and ${context.totalProducts || 0} products. How can I help?`,
          `Good to see you ${context.userName}! I can help with analytics, inventory, or any business insights you need.`,
          `Hey ${context.userName}! Your business intelligence assistant is ready. What shall we analyze today?`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
      }
    }
    
    // Simple questions - Dashboard-aware
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
      return isStorefront 
        ? `I'm doing great, thanks for asking! I'm here to help you find the perfect products. What are you shopping for today?`
        : `I'm functioning optimally! All systems ready to assist with your business operations. What can I help you analyze today?`;
    }
    
    if (lowerMessage.includes('what is your name') || lowerMessage.includes('who are you')) {
      return isStorefront
        ? `I'm your ominbiz Shopping Assistant, powered by AI! I can help you browse products, track orders, and answer any questions about our store.`
        : `I'm ominbiz Business AI, powered by Google Gemini. I analyze your business data, provide insights, and help optimize operations. I've learned from ${conversationHistoryRef.current.length} interactions with you!`;
    }
    
    if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
      return `You're welcome! I'm always here to help. Feel free to ask if you need anything else.`;
    }
    
    // Dashboard-specific queries
    if (isStorefront) {
      // Storefront-specific responses
      if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('shop')) {
        return `We have ${context.availableProducts || 'many'} products available! I can help you find exactly what you need. Are you looking for something specific, or would you like to browse our categories?`;
      }
      
      if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('track')) {
        return context.myOrders > 0
          ? `You have ${context.myOrders} order${context.myOrders !== 1 ? 's' : ''} with us. Would you like me to help you track your latest order or view your order history?`
          : `You haven't placed any orders yet. Would you like to browse our products? I can help you find what you're looking for!`;
      }
      
      if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
        return `I can help you book an appointment! What type of service are you interested in? Let me show you available time slots.`;
      }
    } else {
      // Admin-specific responses
      if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
        return `Your current revenue is $${context.totalRevenue?.toFixed(2) || 0} from ${context.totalOrders || 0} orders. ${context.pendingOrders > 0 ? `You have ${context.pendingOrders} pending orders to process. ` : ''}Navigate to Analytics for detailed sales trends and insights. Shall I guide you there?`;
      }
      
      if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
        return `You have ${context.totalProducts || 0} products in inventory. ${context.lowStockItems > 0 ? `⚠️ Alert: ${context.lowStockItems} items are running low on stock!` : 'Stock levels look good!'} Check the Inventory page for detailed stock management. Need help?`;
      }
      
      if (lowerMessage.includes('appointment')) {
        return `You have ${context.upcomingAppointments || 0} upcoming appointments. Navigate to the Appointments page to view the schedule, manage bookings, and set availability. Would you like help with appointment management?`;
      }
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
    
    // Default intelligent response with learning and dashboard context
    const learningInsight = getRelevantLearning(lowerMessage);
    if (learningInsight) {
      return `${learningInsight} ${isStorefront ? 'How can I help you shop today?' : `You're on the ${context.currentPage} page. ${suggestions[0] ? `Try: "${suggestions[0]}"` : ''}`}`;
    }
    
    if (isStorefront) {
      return `I understand you're asking about "${userMessage}". While I process that, you have ${context.availableProducts || 'many'} products to browse and ${context.myOrders || 0} order${context.myOrders !== 1 ? 's' : ''}. ${suggestions[0] ? `You might want to: "${suggestions[0]}"` : 'How else can I help?'}`;
    } else {
      return `I understand your query about "${userMessage}". Currently on ${context.currentPage} page - you have ${context.totalOrders || 0} orders, $${context.totalRevenue?.toFixed(2) || 0} revenue, and ${context.totalProducts || 0} products. ${suggestions[0] ? `Try: "${suggestions[0]}"` : 'What would you like to explore?'}`;
    }
  };

  // Voice input handler
  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [isRecording]);

  // Copy message to clipboard
  const copyMessage = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    });
  }, []);

  // Rate AI response
  const rateResponse = useCallback((messageId, isPositive) => {
    try {
      const ratings = JSON.parse(localStorage.getItem('aiResponseRatings') || '[]');
      ratings.push({
        messageId,
        isPositive,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('aiResponseRatings', JSON.stringify(ratings));
      // Visual feedback could be added here
    } catch (error) {
      console.error('Rating storage error:', error);
    }
  }, []);
  
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
    link.download = `ominbiz-ai-chat-${new Date().toISOString()}.json`;
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

  // Toggle maximize
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Refresh context data
  const refreshContext = useCallback(async () => {
    // Trigger re-fetch by updating a dependency
    setContextData(prev => ({ ...prev, timestamp: new Date().toISOString() }));
  }, []);

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
          
          <Card className={cn(
            "shadow-2xl border-2 border-primary/30 flex flex-col overflow-hidden backdrop-blur-md bg-card/95 animate-in slide-in-from-bottom-5 duration-300 transition-all",
            isMaximized ? "w-full h-full m-0 rounded-none" : "w-96 sm:w-[480px] h-[650px] rounded-2xl"
          )}>
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
                    onClick={refreshContext}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Refresh Data"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
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
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMaximize}
                    className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
                    title={isMaximized ? "Minimize" : "Maximize"}
                  >
                    {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
              
              {/* Context Info Bar */}
              <div className="relative mt-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {dashboardType === 'admin' ? (
                    <>
                      <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        ${realTimeData.totalRevenue?.toFixed(0) || 0}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                        <Package className="h-3 w-3 mr-1" />
                        {realTimeData.totalOrders || 0} orders
                      </Badge>
                      {realTimeData.lowStockItems > 0 && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {realTimeData.lowStockItems} low stock
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {contextData.availableProducts || 0} products
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                        {contextData.myOrders || 0} my orders
                      </Badge>
                    </>
                  )}
                </div>
                {conversationHistoryRef.current.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                    <Brain className="h-3 w-3 mr-1" />
                    {conversationHistoryRef.current.length} learned
                  </Badge>
                )}
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  AI Assistant Settings
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">AI Personality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['professional', 'friendly', 'technical'].map((style) => (
                        <Button
                          key={style}
                          variant={aiPersonality === style ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAiPersonality(style)}
                          className="capitalize"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">AI Training</p>
                      <p className="text-xs text-muted-foreground">Learn from conversations</p>
                    </div>
                    <Button
                      variant={trainingEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrainingEnabled(!trainingEnabled)}
                    >
                      {trainingEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Training Statistics</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• Conversations: {conversationHistory.length}</p>
                      <p>• Interactions: {conversationHistoryRef.current.length}</p>
                      <p>• Dashboard: {dashboardType === 'storefront' ? 'Customer' : 'Admin'}</p>
                      <p>• Context Items: {Object.keys(contextData).length}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveToHistory}
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Save Current Chat
                  </Button>
                </div>
              </div>
            )}

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
            {!showHistory && !showSettings && (
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
                  
                  <div className="flex-1">
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl p-3 shadow-md transition-all duration-200 hover:shadow-lg group relative",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                          : "bg-card border-2 border-accent/30 text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs opacity-70 flex items-center gap-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        
                        {message.sender === "support" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyMessage(message.text)}
                              title="Copy"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => rateResponse(message.id, true)}
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => rateResponse(message.id, false)}
                              title="Not Helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
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

            {/* Quick Actions - Dashboard Specific */}
            {!showHistory && !showSettings && messages.length <= 2 && (
              <div className="px-4 pb-2 border-t border-border/50 bg-gradient-to-b from-accent/5 to-transparent">
                <div className="flex items-center gap-2 mb-2 mt-3">
                  <Zap className="h-4 w-4 text-accent" />
                  <p className="text-xs font-medium text-accent">Quick Actions:</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dashboardType === 'admin' ? (
                    <>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Show sales summary")}>
                        <DollarSign className="h-3 w-3 mr-1" /> Sales
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Check inventory")}>
                        <Package className="h-3 w-3 mr-1" /> Inventory
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Business insights")}>
                        <Brain className="h-3 w-3 mr-1" /> Insights
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Team status")}>
                        <Users className="h-3 w-3 mr-1" /> Team
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Show products")}>
                        <ShoppingCart className="h-3 w-3 mr-1" /> Browse
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Track my order")}>
                        <Package className="h-3 w-3 mr-1" /> Track Order
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Book appointment")}>
                        <Star className="h-3 w-3 mr-1" /> Book
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSendMessage("Contact support")}>
                        <Sparkles className="h-3 w-3 mr-1" /> Support
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {!showHistory && !showSettings && suggestions.length > 0 && messages.length <= 3 && (
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
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Brain className="h-3 w-3 text-accent animate-pulse" />
                    <span>{dashboardType === 'storefront' ? 'Shopping' : contextData.currentPage}</span>
                    {trainingEnabled && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Training
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {dashboardType === 'admin' && contextData.pendingOrders > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0 animate-pulse">
                        {contextData.pendingOrders} pending
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={dashboardType === 'storefront' ? "Ask me anything about products, orders, or services..." : "Ask me about analytics, inventory, sales, or anything else..."}
                  className="flex-1 min-h-[40px] max-h-[120px] border-2 border-input focus:border-primary transition-all bg-background/50 backdrop-blur-sm allow-select resize-none"
                  rows={1}
                />
                <div className="flex flex-col gap-1">
                  <Button 
                    onClick={handleVoiceInput}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 transition-all duration-200",
                      isRecording && "animate-pulse"
                    )}
                    title={isRecording ? "Stop recording" : "Voice input"}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    onClick={() => handleSendMessage()} 
                    size="icon"
                    disabled={!inputValue.trim() || isTyping}
                    className={cn(
                      "h-10 w-10 transition-all duration-200",
                      inputValue.trim() && "hover:scale-110 shadow-lg shadow-primary/50"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Google Gemini AI • {dashboardType === 'storefront' ? 'Customer' : 'Business'} Mode • Enter to send
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;