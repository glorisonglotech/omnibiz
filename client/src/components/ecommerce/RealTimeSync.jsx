import { useEffect, useCallback, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Real-Time Synchronization Component
 * Handles live updates from WebSocket and database polling
 */
const RealTimeSync = ({ 
  onProductUpdate, 
  onOrderUpdate, 
  onStockUpdate,
  onManualRefresh,
  pollingInterval = 30000 // 30 seconds
}) => {
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const connected = socketContext?.connected || false;
  
  const [lastSync, setLastSync] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error
  const [pendingUpdates, setPendingUpdates] = useState(0);
  const [mode, setMode] = useState('auto'); // auto or manual

  // WebSocket event handlers
  const handleProductUpdate = useCallback((data) => {
    console.log('Product updated:', data);
    onProductUpdate?.(data);
    setPendingUpdates(prev => prev + 1);
    toast.info(`Product "${data.name}" was updated`, {
      icon: '📦',
      duration: 3000
    });
    setLastSync(new Date());
  }, [onProductUpdate]);

  const handleOrderUpdate = useCallback((data) => {
    console.log('Order updated:', data);
    onOrderUpdate?.(data);
    setPendingUpdates(prev => prev + 1);
    toast.info(`Order #${data.orderId} status: ${data.status}`, {
      icon: '🛒',
      duration: 3000
    });
    setLastSync(new Date());
  }, [onOrderUpdate]);

  const handleStockUpdate = useCallback((data) => {
    console.log('Stock updated:', data);
    onStockUpdate?.(data);
    setPendingUpdates(prev => prev + 1);
    
    // Alert for low stock
    if (data.stockQuantity <= data.reorderLevel) {
      toast.warning(`Low stock alert: ${data.productName}`, {
        icon: '⚠️',
        duration: 5000,
        description: `Only ${data.stockQuantity} units remaining`
      });
    }
    setLastSync(new Date());
  }, [onStockUpdate]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for real-time events
    socket.on('product:updated', handleProductUpdate);
    socket.on('product:created', handleProductUpdate);
    socket.on('product:deleted', (data) => {
      toast.error(`Product "${data.name}" was deleted`, {
        icon: '🗑️'
      });
      setLastSync(new Date());
    });

    socket.on('order:updated', handleOrderUpdate);
    socket.on('order:created', handleOrderUpdate);
    socket.on('order:statusChanged', (data) => {
      toast.success(`Order #${data.orderId} is now ${data.status}`, {
        icon: '✅'
      });
      handleOrderUpdate(data);
    });

    socket.on('stock:updated', handleStockUpdate);
    socket.on('stock:lowAlert', (data) => {
      toast.warning(`Stock Alert: ${data.productName}`, {
        icon: '⚠️',
        description: `Current stock: ${data.stockQuantity} (Reorder at: ${data.reorderLevel})`,
        duration: 7000
      });
    });

    // Cleanup
    return () => {
      socket.off('product:updated', handleProductUpdate);
      socket.off('product:created', handleProductUpdate);
      socket.off('product:deleted');
      socket.off('order:updated', handleOrderUpdate);
      socket.off('order:created', handleOrderUpdate);
      socket.off('order:statusChanged');
      socket.off('stock:updated', handleStockUpdate);
      socket.off('stock:lowAlert');
    };
  }, [socket, connected, handleProductUpdate, handleOrderUpdate, handleStockUpdate]);

  // Database polling as backup
  useEffect(() => {
    if (!pollingInterval) return;

    const pollDatabase = async () => {
      setSyncStatus('syncing');
      try {
        // This would call your API to fetch latest data
        // For now, just update the timestamp
        setLastSync(new Date());
        setSyncStatus('idle');
      } catch (error) {
        console.error('Polling error:', error);
        setSyncStatus('error');
      }
    };

    const interval = setInterval(pollDatabase, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval]);

  // Reset pending updates counter
  useEffect(() => {
    if (pendingUpdates > 0) {
      const timeout = setTimeout(() => {
        setPendingUpdates(0);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [pendingUpdates]);

  const formatLastSync = () => {
    const now = new Date();
    const diff = Math.floor((now - lastSync) / 1000); // seconds
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const handleManualRefresh = async () => {
    setSyncStatus('syncing');
    try {
      await onManualRefresh?.();
      setLastSync(new Date());
      setSyncStatus('idle');
      toast.success('Data refreshed successfully!');
    } catch (error) {
      setSyncStatus('error');
      toast.error('Failed to refresh data');
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm flex-wrap">
      {/* Connection Status */}
      <Badge 
        variant={connected ? "default" : "secondary"}
        className={cn(
          "gap-2 transition-all cursor-pointer",
          connected && "bg-green-600 hover:bg-green-700"
        )}
        onClick={!connected ? handleManualRefresh : undefined}
        title={!connected ? "Click to refresh data manually" : "Real-time updates active"}
      >
        {connected ? (
          <>
            <Wifi className="h-3 w-3" />
            Live
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3" />
            Local Mode
          </>
        )}
      </Badge>

      {/* Sync Status */}
      {syncStatus === 'syncing' && (
        <Badge variant="secondary" className="gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing...
        </Badge>
      )}

      {syncStatus === 'error' && (
        <Badge variant="destructive" className="gap-2">
          <AlertCircle className="h-3 w-3" />
          Sync Error
        </Badge>
      )}

      {/* Pending Updates */}
      {pendingUpdates > 0 && (
        <Badge variant="outline" className="gap-2 animate-bounce">
          <RefreshCw className="h-3 w-3" />
          {pendingUpdates} update{pendingUpdates !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Last Sync Time */}
      <span className="text-muted-foreground text-xs">
        Last sync: {formatLastSync()}
      </span>
    </div>
  );
};

export default RealTimeSync;
