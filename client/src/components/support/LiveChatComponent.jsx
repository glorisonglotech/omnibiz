import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Video, Mic, MicOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LiveChatComponent = ({
  chatMessages = [],
  newMessage,
  isTyping = false,
  activeAgent,
  chatStatus = 'online',
  isRecording = false,
  onMessageChange,
  onSendMessage,
  onFileUpload,
  onStartVideoCall,
  onToggleRecording
}) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeAgent?.avatar} />
              <AvatarFallback>
                {activeAgent?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{activeAgent?.name}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  chatStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                }`} />
                <span className="text-sm text-muted-foreground capitalize">{chatStatus}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onStartVideoCall}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Video Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleRecording}
              className={`flex items-center gap-2 ${isRecording ? 'text-red-600 border-red-600' : ''}`}
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
                          {message.agent?.name?.split(' ').map(n => n[0]).join('')}
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
                    {message.timestamp?.toLocaleTimeString()}
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
              onChange={onFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={onMessageChange}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              className="flex-1"
            />
            <Button onClick={onSendMessage} disabled={!newMessage?.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChatComponent;
