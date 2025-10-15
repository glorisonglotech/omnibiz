import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! 👋 I'm your AI assistant. How can I help you today?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI typing and response
    setTimeout(() => {
      setIsTyping(false);
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! Our AI is processing your request. A human agent will assist you if needed. 🤖✨",
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1500);
  };

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

            {/* Messages Area with Better Visibility */}
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

            {/* Enhanced Input Area */}
            <div className="p-4 border-t-2 border-border bg-card/50 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border-2 border-input focus:border-primary transition-all bg-background/50 backdrop-blur-sm"
                />
                <Button 
                  onClick={handleSendMessage} 
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
              <p className="text-xs text-muted-foreground mt-2 text-center">
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