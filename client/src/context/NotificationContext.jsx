import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useCustomerAuth } from './CustomerAuthContext';
import { toast } from 'sonner';
import { MessageCircle, ShoppingCart, Calendar, Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket, connected } = useSocket();
  const { customer } = useCustomerAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket || !customer) return;

    // New message notification
    socket.on('new_message_notification', (data) => {
      const now = new Date();
      const notification = {
        id: Date.now(),
        type: 'message',
        title: 'New Message',
        message: `${data.from}: ${data.preview}`,
        preview: data.preview,
        from: data.from,
        timestamp: now,
        read: false,
        data: data
      };
      
      addNotification(notification);
      setMessageUnreadCount(prev => prev + 1);
      
      toast.info(
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{data.from}</p>
              <span className="text-xs text-muted-foreground">
                {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{data.preview}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    });

    // Order update notification
    socket.on('order_updated', (data) => {
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

    // Service/Appointment update notification
    socket.on('appointment_updated', (data) => {
      const notification = {
        id: Date.now(),
        type: 'appointment',
        title: 'Appointment Update',
        message: `Your appointment - ${data.status || 'Updated'}`,
        timestamp: new Date(),
        read: false,
        data: data
      };
      
      addNotification(notification);
      
      toast.info(
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <p className="font-semibold">Appointment Update</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    });

    // General notification
    socket.on('notification', (data) => {
      const notification = {
        id: Date.now(),
        type: data.type || 'general',
        title: data.title || 'Notification',
        message: data.message,
        timestamp: new Date(),
        read: false,
        data: data
      };
      
      addNotification(notification);
      
      toast(
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
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
      socket.off('order_updated');
      socket.off('appointment_updated');
      socket.off('notification');
    };
  }, [socket, customer]);

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
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const resetMessageUnreadCount = () => {
    setMessageUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    messageUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    resetMessageUnreadCount,
    connected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
