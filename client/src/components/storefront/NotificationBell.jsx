import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, MessageCircle, ShoppingCart, Calendar, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotification,
    clearAllNotifications 
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-background hover:bg-accent' 
                        : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{notification.title}</p>
                            {notification.from && (
                              <p className="text-xs text-muted-foreground">{notification.from}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.preview || notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="absolute right-2 top-2 h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationBell;
