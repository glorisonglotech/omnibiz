import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, MessageCircle, ShoppingCart, Calendar, Trash2, CheckCheck, X } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const DashboardNotificationBell = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    // New message notification
    socket.on('new_message_notification', (data) => {
      const notification = {
        id: Date.now(),
        type: 'message',
        title: 'New Message',
        message: `${data.from}: ${data.preview}`,
        timestamp: new Date(),
        read: false,
        data: data
      };
      
      addNotification(notification);
      
      toast.info(
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold">{data.from}</p>
            <p className="text-sm text-muted-foreground">{data.preview}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    });

    // Message reply notification (when customer replies)
    socket.on('message_received', (message) => {
      // Only notify if not the sender
      if (message.senderId !== user._id) {
        const notification = {
          id: Date.now(),
          type: 'message',
          title: 'Message Reply',
          message: `${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
          timestamp: new Date(message.timestamp),
          read: false,
          data: { conversationId: message.conversationId, messageId: message.id }
        };
        
        addNotification(notification);
        
        toast.info(
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-semibold">{message.senderName}</p>
              <p className="text-sm text-muted-foreground">
                {message.content.substring(0, 50)}{message.content.length > 50 ? '...' : ''}
              </p>
            </div>
          </div>,
          { duration: 5000 }
        );
      }
    });

    // Order update notification
    socket.on('order_notification', (data) => {
      const notification = {
        id: Date.now(),
        type: 'order',
        title: 'Order Update',
        message: `Order #${data.orderNumber || 'N/A'} - ${data.status || 'Updated'}`,
        timestamp: new Date(),
        read: false,
        data: data
      };
      
      addNotification(notification);
      
      toast.success(
        <div className="flex items-start gap-3">
          <ShoppingCart className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold">Order Update</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    });

    // System notification
    socket.on('system_notification', (data) => {
      const notification = {
        id: Date.now(),
        type: 'system',
        title: data.title || 'System Alert',
        message: data.message,
        timestamp: new Date(),
        read: false,
        data: data
      };
      
      addNotification(notification);
      
      toast(
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <p className="font-semibold">{notification.title}</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    });

    return () => {
      socket.off('new_message_notification');
      socket.off('message_received');
      socket.off('order_notification');
      socket.off('system_notification');
    };
  }, [socket, user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-orange-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearAllNotifications}
                className="h-8 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-background hover:bg-accent' 
                      : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {!notification.read && (
                    <div className="absolute right-2 top-2 h-2 w-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DashboardNotificationBell;
