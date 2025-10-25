import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return safe defaults instead of throwing
    console.warn('useSocket called outside SocketProvider, returning defaults');
    return {
      socket: null,
      connected: false,
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
      removeNotification: () => {},
      joinRoom: () => {},
      leaveRoom: () => {},
      startTyping: () => {},
      stopTyping: () => {},
      emit: () => {}
    };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  let user, token, customer;
  
  try {
    ({ user, token } = useAuth());
  } catch (e) {
    // Not in AuthProvider scope
    user = null;
    token = null;
  }
  
  try {
    ({ customer } = useCustomerAuth());
  } catch (e) {
    // Not in CustomerAuthProvider scope
    customer = null;
  }

  // Get the appropriate token (admin or customer)
  const authToken = token || localStorage.getItem('customerToken');
  const isAuthenticated = !!(user || customer);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: authToken
        },
        autoConnect: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        toast.success('Connected to real-time notifications');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
        toast.info('Disconnected from real-time notifications');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
        toast.error('Failed to connect to real-time notifications');
      });

      // Order update notifications
      newSocket.on('order_updated', (data) => {
        console.log('Order updated:', data);
        addNotification({
          id: Date.now(),
          type: 'order_update',
          title: 'Order Updated',
          message: data.data.message || `Order ${data.data.orderNumber} has been updated`,
          data: data.data,
          timestamp: new Date(data.timestamp),
          read: false
        });
        
        toast.success(`Order ${data.data.orderNumber}: ${data.data.message}`);
      });

      // New order notifications (for admins)
      newSocket.on('new_order', (data) => {
        console.log('New order:', data);
        addNotification({
          id: Date.now(),
          type: 'new_order',
          title: 'New Order Received',
          message: `New order from ${data.data.clientName} - $${data.data.total}`,
          data: data.data,
          timestamp: new Date(data.timestamp),
          read: false
        });
        
        toast.info(`New order: ${data.data.orderNumber} from ${data.data.clientName}`);
      });

      // Service request update notifications
      newSocket.on('service_request_updated', (data) => {
        console.log('Service request updated:', data);
        addNotification({
          id: Date.now(),
          type: 'service_request_update',
          title: 'Service Request Updated',
          message: data.data.message || `Service request ${data.data.requestNumber} has been updated`,
          data: data.data,
          timestamp: new Date(data.timestamp),
          read: false
        });
        
        toast.success(`Service Request ${data.data.requestNumber}: ${data.data.message}`);
      });

      // New service request notifications (for admins)
      newSocket.on('new_service_request', (data) => {
        console.log('New service request:', data);
        addNotification({
          id: Date.now(),
          type: 'new_service_request',
          title: 'New Service Request',
          message: `New ${data.data.serviceType} request from ${data.data.clientName}`,
          data: data.data,
          timestamp: new Date(data.timestamp),
          read: false
        });
        
        toast.info(`New service request: ${data.data.title} from ${data.data.clientName}`);
      });

      // General notifications
      newSocket.on('notification', (data) => {
        console.log('General notification:', data);
        addNotification({
          id: Date.now(),
          type: data.type || 'general',
          title: data.title || 'Notification',
          message: data.message,
          data: data.data,
          timestamp: new Date(data.timestamp),
          read: false
        });
        
        if (data.showToast !== false) {
          toast.info(data.message);
        }
      });

      // Typing indicators
      newSocket.on('user_typing', (data) => {
        console.log('User typing:', data);
        // Handle typing indicators in chat/messaging components
      });

      newSocket.on('user_stopped_typing', (data) => {
        console.log('User stopped typing:', data);
        // Handle stop typing indicators
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, authToken, user, customer]);

  // Add notification to the list
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Remove specific notification
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  // Join a room
  const joinRoom = (roomName) => {
    if (socket) {
      socket.emit('join_room', roomName);
    }
  };

  // Leave a room
  const leaveRoom = (roomName) => {
    if (socket) {
      socket.emit('leave_room', roomName);
    }
  };

  // Send typing indicator
  const startTyping = (room) => {
    if (socket) {
      socket.emit('typing_start', { room });
    }
  };

  // Stop typing indicator
  const stopTyping = (room) => {
    if (socket) {
      socket.emit('typing_stop', { room });
    }
  };

  // Emit custom event
  const emit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    emit
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
