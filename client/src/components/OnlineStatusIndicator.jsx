import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

const OnlineStatusIndicator = ({ showBadge = true, className = "" }) => {
  const { isOnline, wasOffline } = useOnlineStatus();

  useEffect(() => {
    if (wasOffline) {
      toast.success('Back online!', {
        description: 'Your internet connection has been restored.',
        icon: <CheckCircle className="h-4 w-4" />
      });
    }
  }, [wasOffline]);

  useEffect(() => {
    if (!isOnline) {
      toast.error('No internet connection', {
        description: 'You are currently offline. Some features may not work.',
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity
      });
    }
  }, [isOnline]);

  if (!showBadge) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 animate-pulse">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      )}
    </div>
  );
};

export default OnlineStatusIndicator;
