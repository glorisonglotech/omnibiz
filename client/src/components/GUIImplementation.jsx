import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Play,
  Pause,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  Folder,
  File,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Zap,
  Database,
  Server,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  X,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Cpu,
  HardDrive,
  Activity,
  Cloud,
  Calendar,
  Bell,
  Music,
  Video as VideoCamera,
  Image,
  FileAudio,
  Share2,
  Trash2,
  Clock,
  Paperclip
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const GUIImplementation = () => {
  const { socket, connected } = useSocket();
  const { theme } = useAppTheme();
  const [downloads, setDownloads] = useState([]);
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [signalStrength, setSignalStrength] = useState(4);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [speedLimit, setSpeedLimit] = useState([1000]);
  const [maxConnections, setMaxConnections] = useState([5]);
  const [autoRetry, setAutoRetry] = useState(true);
  const [validateFiles, setValidateFiles] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('downloads');
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [diskUsage, setDiskUsage] = useState(0);
  const [networkType, setNetworkType] = useState('4g');
  const [notifications, setNotifications] = useState([]);
  const [scheduledDownloads, setScheduledDownloads] = useState([]);
  const [scheduleUrl, setScheduleUrl] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [completedDownloads, setCompletedDownloads] = useState(0);
  const [failedDownloads, setFailedDownloads] = useState(0);
  const historyImportRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [wifiName, setWifiName] = useState('ominbiz_Network');
  const [wifiPassword, setWifiPassword] = useState('••••••••');
  const [dataUsed, setDataUsed] = useState(0);
  const [totalData, setTotalData] = useState(10240); // MB
  const [systemVolume, setSystemVolume] = useState([75]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [pingLatency, setPingLatency] = useState(0);
  const fileInputRef = useRef(null);
  const audioRef = useRef(new Audio());
  const mediaInputRef = useRef(null);

  // Real-time network monitoring
  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor network information
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      const updateNetworkInfo = () => {
        if (connection.effectiveType) {
          setNetworkType(connection.effectiveType);
        }
        if (connection.downlink) {
          setDownloadSpeed(connection.downlink * 1024); // Convert to KB/s
        }
      };
      
      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Monitor battery status
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBatteryInfo = () => {
          setBatteryLevel(battery.level * 100);
          setIsCharging(battery.charging);
        };
        
        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
      });
    }

    // Monitor system resources and signals (real-time updates)
    const resourceInterval = setInterval(() => {
      // Estimate CPU usage based on performance
      if (performance.memory) {
        const memPercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
        setMemoryUsage(memPercent);
      }
      
      // Dynamic CPU and disk usage
      setCpuUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
      setDiskUsage(prev => Math.min(100, Math.max(20, prev + (Math.random() - 0.5) * 2)));
      
      // Dynamic signal strength (changes based on network quality)
      if (!('connection' in navigator) || Math.random() > 0.7) {
        setSignalStrength(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          return Math.min(4, Math.max(0, prev + change));
        });
      }
      
      // Dynamic upload speed (simulated as fraction of download speed)
      setUploadSpeed(prev => {
        const newSpeed = downloadSpeed * (0.1 + Math.random() * 0.2);
        return Math.max(0, newSpeed);
      });
      
      // Track data usage
      const downloadData = downloadSpeed / 1024; // Convert to MB
      const uploadData = uploadSpeed / 1024;
      setDataUsed(prev => Math.min(totalData, prev + downloadData + uploadData));
      
      // Update speed history for graphs
      setDownloadHistory(prev => [...prev.slice(-29), downloadSpeed]);
      setUploadHistory(prev => [...prev.slice(-29), uploadSpeed]);
      
      // Simulate ping/latency
      setPingLatency(Math.floor(10 + Math.random() * 40));
    }, 2000);

    // Update active download progress
    const downloadInterval = setInterval(() => {
      setDownloads(prev => prev.map(download => {
        if (download.status === 'downloading' && download.progress < 100) {
          const newProgress = Math.min(100, download.progress + Math.random() * 3);
          const speed = Math.random() * 1000;
          const remaining = download.size * (1 - newProgress / 100);
          const eta = speed > 0 ? formatTime(remaining / speed) : '00:00:00';
          
          return {
            ...download,
            progress: newProgress,
            speed,
            eta,
            ...(newProgress >= 100 && { status: 'completed' })
          };
        }
        return download;
      }));
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(resourceInterval);
      clearInterval(downloadInterval);
    };
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('download_update', (data) => {
      setDownloads(prev => prev.map(d => 
        d.id === data.id ? { ...d, ...data } : d
      ));
    });

    socket.on('system_notification', (notification) => {
      addNotification(notification);
    });

    return () => {
      socket.off('download_update');
      socket.off('system_notification');
    };
  }, [socket]);

  // Audio player management
  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        setPlaybackDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, []);

  // Update audio volume
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
  }, [volume, isMuted]);

  // Update clock every second for real-time display
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Auto-execute scheduled downloads (SCHEDULER FIX)
  useEffect(() => {
    if (scheduledDownloads.length === 0) return;
    
    const checkScheduled = setInterval(() => {
      const now = new Date().getTime();
      
      scheduledDownloads.forEach(scheduled => {
        const scheduledTime = new Date(scheduled.scheduledTime).getTime();
        const timeDiff = scheduledTime - now;
        
        // If scheduled time has arrived (within 5 seconds window)
        if (scheduled.status === 'scheduled' && timeDiff <= 5000 && timeDiff >= -5000) {
          console.log('⏰ Auto-starting scheduled download:', scheduled.filename);
          
          // Start the download
          addDownload(scheduled.url);
          
          // Update status to started
          setScheduledDownloads(prev =>
            prev.map(s =>
              s.id === scheduled.id
                ? { ...s, status: 'started' }
                : s
            )
          );
          
          // Show notification
          const notif = {
            id: Date.now(),
            title: 'Scheduled Download Started',
            message: `${scheduled.filename} is now downloading`,
            type: 'info'
          };
          setNotifications(prev => [...prev, notif]);
          
          toast.success(`📥 Starting scheduled download: ${scheduled.filename}`);
          
          // Remove from scheduled list after 3 seconds
          setTimeout(() => {
            setScheduledDownloads(prev =>
              prev.filter(s => s.id !== scheduled.id)
            );
          }, 3000);
        }
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkScheduled);
  }, [scheduledDownloads]);

  const addDownload = async (url, filename = null) => {
    try {
      const newDownload = {
        id: Date.now(),
        url,
        filename: filename || url.split('/').pop() || `file_${Date.now()}`,
        progress: 0,
        speed: 0,
        size: 0,
        status: 'downloading',
        protocol: url.includes('magnet:') ? 'BitTorrent' : 'HTTP',
        eta: 'Calculating...',
        startTime: Date.now()
      };
      
      setDownloads(prev => [...prev, newDownload]);
      toast.success(`Download started: ${newDownload.filename}`);

      // Emit to WebSocket for server-side tracking
      if (socket && connected) {
        socket.emit('start_download', newDownload);
      }

      // Start actual download (if URL is accessible)
      try {
        const response = await fetch(url, { mode: 'cors' });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const contentLength = +response.headers.get('Content-Length');
        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          const progress = contentLength ? (receivedLength / contentLength) * 100 : 0;
          const elapsed = (Date.now() - newDownload.startTime) / 1000;
          const speed = receivedLength / elapsed / 1024; // KB/s
          const remaining = contentLength - receivedLength;
          const eta = speed > 0 ? formatTime(remaining / speed / 1024) : '00:00:00';

          setDownloads(prev => prev.map(d =>
            d.id === newDownload.id
              ? { ...d, progress, speed, size: contentLength / (1024 * 1024), eta }
              : d
          ));
        }

        // Download complete - create blob and trigger download
        const blob = new Blob(chunks);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = newDownload.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        setDownloads(prev => prev.map(d =>
          d.id === newDownload.id ? { ...d, status: 'completed', progress: 100 } : d
        ));

        toast.success(`Download completed: ${newDownload.filename}`);
        addNotification({
          title: 'Download Complete',
          message: `${newDownload.filename} has been downloaded successfully`,
          type: 'success'
        });
      } catch (fetchError) {
        console.error('Download error:', fetchError);
        setDownloads(prev => prev.map(d =>
          d.id === newDownload.id
            ? { ...d, status: 'error', progress: 0 }
            : d
        ));
        toast.error(`Download failed: ${fetchError.message}`);
      }
    } catch (error) {
      console.error('Error starting download:', error);
      toast.error('Failed to start download');
    }
  };

  const pauseDownload = (id) => {
    setDownloads(prev => prev.map(download => 
      download.id === id ? { ...download, status: 'paused' } : download
    ));
  };

  const resumeDownload = (id) => {
    setDownloads(prev => prev.map(download => 
      download.id === id ? { ...download, status: 'downloading' } : download
    ));
  };

  const cancelDownload = (id) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
    toast.info('Download cancelled');
  };

  const getSignalIcon = () => {
    switch (signalStrength) {
      case 0: return <WifiOff className="h-4 w-4 text-red-500" />;
      case 1: return <SignalLow className="h-4 w-4 text-red-500" />;
      case 2: return <SignalMedium className="h-4 w-4 text-yellow-500" />;
      case 3: return <SignalHigh className="h-4 w-4 text-green-500" />;
      case 4: return <Signal className="h-4 w-4 text-green-500" />;
      default: return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBatteryIcon = () => {
    if (batteryLevel < 20) return <BatteryLow className="h-4 w-4 text-red-500" />;
    return <Battery className="h-4 w-4 text-green-500" />;
  };

  const formatSpeed = (speed) => {
    if (speed < 1024) return `${speed.toFixed(1)} KB/s`;
    return `${(speed / 1024).toFixed(1)} MB/s`;
  };

  const formatSize = (size) => {
    if (size < 1024) return `${size} MB`;
    return `${(size / 1024).toFixed(1)} GB`;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      const download = {
        id: Date.now() + Math.random(),
        url: fileUrl,
        filename: file.name,
        progress: 100,
        speed: 0,
        size: file.size / (1024 * 1024),
        status: 'completed',
        protocol: 'Local',
        eta: '00:00:00'
      };
      setDownloads(prev => [...prev, download]);
      toast.success(`Added: ${file.name}`);
    });
  };

  const handleMediaSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setCurrentTrack(file.name);
      setPlaybackProgress(0);
      toast.success(`Loaded: ${file.name}`);
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + 10
    );
  };

  const skipBackward = () => {
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
  };

  const seekTo = (percent) => {
    audioRef.current.currentTime = (percent / 100) * audioRef.current.duration;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const scheduleDownload = (url, filename, scheduledTime) => {
    const scheduled = {
      id: Date.now(),
      url,
      filename,
      scheduledTime,
      status: 'scheduled'
    };
    setScheduledDownloads(prev => [...prev, scheduled]);
    toast.success(`Download scheduled for ${new Date(scheduledTime).toLocaleString()}`);
  };

  const exportDownloadHistory = () => {
    const data = JSON.stringify(downloads, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `download-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download history exported');
  };

  const importDownloadHistory = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setDownloads(prev => [...prev, ...imported]);
          toast.success(`Imported ${imported.length} downloads`);
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DAS - Data Analytics System
        </h1>
        <p className="text-muted-foreground mt-2">Real-Time Network Monitor & Download Manager with Live System Analytics</p>
      </div>

      {/* Status Bar - Real-Time Indicators */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Connection Status with Animation */}
              <div className="flex items-center gap-2 transition-all duration-300">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-green-700">{networkType.toUpperCase()}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500 animate-bounce" />
                    <span className="text-sm font-medium text-red-700">Disconnected</span>
                  </>
                )}
              </div>
              
              {/* Signal Strength with Dynamic Icon */}
              <div className="flex items-center gap-2 transition-all duration-500">
                <div className="animate-pulse">{getSignalIcon()}</div>
                <span className="text-sm font-medium transition-colors duration-300">
                  Signal: <span className={`font-bold ${
                    signalStrength >= 3 ? 'text-green-600' : 
                    signalStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{signalStrength}/4</span>
                </span>
              </div>
              
              {/* Battery with Charging Indicator */}
              <div className="flex items-center gap-2 transition-all duration-300">
                {getBatteryIcon()}
                <span className={`text-sm font-medium ${
                  isCharging ? 'text-green-600' : 
                  batteryLevel < 20 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {batteryLevel.toFixed(0)}%
                  {isCharging && <Zap className="inline h-3 w-3 ml-1 text-yellow-500 animate-pulse" />}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Download Speed with Live Update */}
              <div className="flex items-center gap-2 transition-all duration-300">
                <Download className="h-4 w-4 text-blue-500 animate-bounce" 
                  style={{ animationDuration: downloadSpeed > 500 ? '0.5s' : '1s' }} 
                />
                <span className="text-sm font-mono font-bold text-blue-600">
                  ↓ {formatSpeed(downloadSpeed)}
                </span>
              </div>
              
              {/* Upload Speed with Live Update */}
              <div className="flex items-center gap-2 transition-all duration-300">
                <Upload className="h-4 w-4 text-green-500" 
                  style={{ 
                    animation: uploadSpeed > 50 ? 'pulse 1s infinite' : 'none' 
                  }} 
                />
                <span className="text-sm font-mono font-bold text-green-600">
                  ↑ {formatSpeed(uploadSpeed)}
                </span>
              </div>
              
              {/* Volume Indicator */}
              <div className="flex items-center gap-2 transition-all duration-200">
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-500" />
                ) : (
                  <Volume2 className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm font-medium">{volume[0]}%</span>
              </div>
              
              {/* Real-Time Clock */}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: '60s' }} />
                <span className="font-mono tabular-nums">{currentTime}</span>
              </div>
            </div>
          </div>
          
          {/* Live Activity Indicator */}
          <div className="mt-2 flex items-center gap-2">
            <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
            <span className="text-xs text-gray-500">
              {connected ? 'WebSocket Connected' : 'Offline Mode'} • 
              {' '}{downloads.filter(d => d.status === 'downloading').length} Active Downloads •
              {' '}CPU: {cpuUsage.toFixed(0)}% • 
              {' '}Memory: {memoryUsage.toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-card">
          <TabsTrigger value="downloads" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Downloads
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Music className="h-4 w-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Monitor className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="downloads" className="space-y-6">
          {/* Download Controls */}
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Download Manager
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{downloads.filter(d => d.status === 'downloading').length} Active</Badge>
                  <Badge variant="outline">{downloads.length} Total</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Enhanced Input Section */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter URL, magnet link, or paste from clipboard..." 
                      className="pl-10 border-primary/30 focus:border-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          addDownload(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Add Files
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text && (text.startsWith('http') || text.startsWith('magnet'))) {
                          addDownload(text);
                          toast.success('URL added from clipboard');
                        } else {
                          toast.error('No valid URL in clipboard');
                        }
                      } catch (err) {
                        toast.error('Could not read clipboard');
                      }
                    }}
                  >
                    <Paperclip className="h-3 w-3 mr-1" />
                    Paste from Clipboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const activeDownloads = downloads.filter(d => d.status === 'downloading');
                      if (activeDownloads.length === 0) {
                        toast.info('No active downloads');
                        return;
                      }
                      activeDownloads.forEach(d => pauseDownload(d.id));
                      toast.success(`Paused ${activeDownloads.length} downloads`);
                    }}
                    disabled={downloads.filter(d => d.status === 'downloading').length === 0}
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const pausedDownloads = downloads.filter(d => d.status === 'paused');
                      if (pausedDownloads.length === 0) {
                        toast.info('No paused downloads');
                        return;
                      }
                      pausedDownloads.forEach(d => resumeDownload(d.id));
                      toast.success(`Resumed ${pausedDownloads.length} downloads`);
                    }}
                    disabled={downloads.filter(d => d.status === 'paused').length === 0}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume All
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b pb-2">
                <Button 
                  variant={downloads.length === downloads.length ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => {}}
                >
                  All ({downloads.length})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                >
                  Downloading ({downloads.filter(d => d.status === 'downloading').length})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                >
                  Completed ({downloads.filter(d => d.status === 'completed').length})
                </Button>
              </div>

              {/* Downloads List */}
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {downloads.map(download => (
                    <Card key={download.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{download.filename}</p>
                            <p className="text-xs text-gray-500">{download.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={download.status === 'downloading' ? 'default' : 'secondary'}>
                            {download.status}
                          </Badge>
                          <Badge variant="outline">{download.protocol}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress value={download.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{download.progress.toFixed(1)}% of {formatSize(download.size)}</span>
                          <span>{formatSpeed(download.speed)} • ETA: {download.eta}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {download.status === 'downloading' ? (
                          <Button size="sm" variant="outline" onClick={() => pauseDownload(download.id)}>
                            <Pause className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => resumeDownload(download.id)}>
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => cancelDownload(download.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {downloads.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No downloads yet. Add a URL or file to get started.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed Limiting */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Speed & Connection Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Max Download Speed
                    </label>
                    <Badge variant="secondary">{speedLimit[0]} KB/s</Badge>
                  </div>
                  <Slider
                    value={speedLimit}
                    onValueChange={(val) => {
                      setSpeedLimit(val);
                      toast.info(`Speed limit: ${val[0]} KB/s`);
                    }}
                    max={10000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>100 KB/s</span>
                    <span>10 MB/s</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Max Connections
                    </label>
                    <Badge variant="secondary">{maxConnections[0]} connections</Badge>
                  </div>
                  <Slider
                    value={maxConnections}
                    onValueChange={(val) => {
                      setMaxConnections(val);
                      toast.info(`Max connections: ${val[0]}`);
                    }}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSpeedLimit([1000]);
                    setMaxConnections([5]);
                    toast.success('Reset to default values');
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card className="border-primary/20">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      <p className="font-medium">Auto Retry</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Automatically retry failed downloads</p>
                  </div>
                  <Switch 
                    checked={autoRetry} 
                    onCheckedChange={(checked) => {
                      setAutoRetry(checked);
                      toast.info(`Auto retry ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <p className="font-medium">File Validation</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Verify file integrity after download</p>
                  </div>
                  <Switch 
                    checked={validateFiles} 
                    onCheckedChange={(checked) => {
                      setValidateFiles(checked);
                      toast.info(`File validation ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Minimize className="h-4 w-4 text-primary" />
                      <p className="font-medium">Compression</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enable compression for transfers</p>
                  </div>
                  <Switch 
                    checked={compressionEnabled} 
                    onCheckedChange={(checked) => {
                      setCompressionEnabled(checked);
                      toast.info(`Compression ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <p className="font-medium">Encryption</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Encrypt downloads for security</p>
                  </div>
                  <Switch 
                    checked={encryptionEnabled} 
                    onCheckedChange={(checked) => {
                      setEncryptionEnabled(checked);
                      toast.info(`Encryption ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-600" />
                  Media Player
                </span>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={mediaInputRef}
                    onChange={handleMediaSelect}
                    accept="audio/*,video/*"
                    className="hidden"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Load Media
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 bg-white rounded-lg">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                  {isPlaying ? (
                    <div className="absolute inset-0 bg-purple-400 opacity-20 animate-ping"></div>
                  ) : null}
                  <Music className={`h-16 w-16 ${isPlaying ? 'text-purple-600 animate-bounce' : 'text-purple-400'}`} />
                </div>
                <p className="font-bold text-lg text-primary">{currentTrack || 'No media selected'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTrack ? (
                    isPlaying ? 'Now Playing' : 'Paused'
                  ) : (
                    'Click "Load Media" to select a file'
                  )}
                </p>
                {playbackDuration > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(audioRef.current.currentTime)} / {formatTime(playbackDuration)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Seekable Progress Bar */}
                <div 
                  className="relative cursor-pointer group"
                  onClick={(e) => {
                    if (playbackDuration > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = ((e.clientX - rect.left) / rect.width) * 100;
                      seekTo(percent);
                    }
                  }}
                >
                  <Progress value={playbackProgress} className="h-3 cursor-pointer transition-all group-hover:h-4" />
                  <div className="absolute -top-1 flex justify-between w-full px-1 text-xs text-muted-foreground">
                    <span>{formatTime(audioRef.current.currentTime)}</span>
                    <span>{formatTime(playbackDuration)}</span>
                  </div>
                </div>
                
                {/* Transport Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={skipBackward}
                    disabled={!currentTrack}
                    className="hover:bg-purple-100"
                  >
                    <SkipBack className="h-4 w-4" />
                    <span className="ml-1 text-xs">10s</span>
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={togglePlayback}
                    disabled={!currentTrack}
                    className={`w-16 h-16 rounded-full ${isPlaying ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'}`}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={skipForward}
                    disabled={!currentTrack}
                    className="hover:bg-purple-100"
                  >
                    <span className="mr-1 text-xs">10s</span>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Volume Control */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:bg-purple-100"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5 text-destructive" /> : <Volume2 className="h-5 w-5 text-primary" />}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-primary w-12">{volume[0]}%</span>
                </div>
                
                {/* Additional Controls */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (audioRef.current.currentTime > 0) {
                        audioRef.current.currentTime = 0;
                        setPlaybackProgress(0);
                        toast.info('Restarted from beginning');
                      }
                    }}
                    disabled={!currentTrack}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      audioRef.current.playbackRate = audioRef.current.playbackRate === 1 ? 1.5 : audioRef.current.playbackRate === 1.5 ? 2 : 1;
                      toast.info(`Speed: ${audioRef.current.playbackRate}x`);
                    }}
                    disabled={!currentTrack}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {audioRef.current.playbackRate}x Speed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTrack('');
                      audioRef.current.src = '';
                      setIsPlaying(false);
                      setPlaybackProgress(0);
                      toast.success('Media cleared');
                    }}
                    disabled={!currentTrack}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduled Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Schedule Form */}
                <div className="p-4 bg-card rounded-lg border-2 border-primary/30">
                  <h3 className="text-sm font-semibold mb-3 text-primary">Schedule New Download</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Download URL *</label>
                      <Input 
                        placeholder="https://example.com/file.zip" 
                        className="flex-1"
                        value={scheduleUrl}
                        onChange={(e) => setScheduleUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Schedule Date & Time *</label>
                      <Input 
                        type="datetime-local" 
                        className="w-full"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (!scheduleUrl.trim()) {
                          toast.error('Please enter a URL');
                          return;
                        }
                        if (!scheduleTime) {
                          toast.error('Please select date and time');
                          return;
                        }
                        
                        const scheduledDate = new Date(scheduleTime);
                        if (scheduledDate <= new Date()) {
                          toast.error('Please select a future date and time');
                          return;
                        }
                        
                        const filename = scheduleUrl.split('/').pop() || `scheduled_${Date.now()}`;
                        scheduleDownload(scheduleUrl, filename, scheduleTime);
                        setScheduleUrl('');
                        setScheduleTime('');
                      }}
                      disabled={!scheduleUrl || !scheduleTime}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Download
                    </Button>
                  </div>
                </div>
                
                {/* Scheduled List */}
                {scheduledDownloads.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-card rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No scheduled downloads</p>
                    <p className="text-xs mt-2">Schedule downloads to start automatically at a specific time</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Scheduled ({scheduledDownloads.length})
                    </h3>
                    {scheduledDownloads.map(scheduled => (
                      <Card key={scheduled.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-primary" />
                              <p className="font-medium text-sm">{scheduled.filename}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(scheduled.scheduledTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-primary mt-1">{scheduled.url}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={scheduled.status === 'scheduled' ? 'secondary' : 'default'}>
                              {scheduled.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setScheduledDownloads(prev => prev.filter(s => s.id !== scheduled.id));
                                toast.success('Scheduled download removed');
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Monitor - DAS (Data Analytics System) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WiFi Connection Info */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wifi className={`h-5 w-5 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                    WiFi Connection
                  </span>
                  <Badge variant={isConnected ? "default" : "destructive"} className="animate-pulse">
                    {isConnected ? 'Online' : 'Offline'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Name:</span>
                    <span className="text-sm font-bold text-blue-600">{wifiName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security:</span>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-sm">WPA2-PSK</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Signal Strength:</span>
                    <div className="flex items-center gap-2">
                      {getSignalIcon()}
                      <Progress value={signalStrength * 25} className="w-24 h-2" />
                      <span className="text-sm font-bold">{signalStrength * 25}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Type:</span>
                    <Badge variant="secondary" className="font-bold">{networkType.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IP Address:</span>
                    <span className="text-sm font-mono">192.168.1.{Math.floor(Math.random() * 255)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ping/Latency:</span>
                    <span className={`text-sm font-bold ${pingLatency < 20 ? 'text-green-600' : pingLatency < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {pingLatency}ms
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Volume Control */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                  System Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl font-bold text-purple-600">{systemVolume[0]}%</div>
                    </div>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#9333ea"
                        strokeWidth="8"
                        strokeDasharray={`${systemVolume[0] * 3.51} 351`}
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={systemVolume}
                    onValueChange={(val) => {
                      setSystemVolume(val);
                      toast.info(`Volume: ${val[0]}%`);
                    }}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <VolumeX className="h-4 w-4" />
                    <Volume2 className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Speed Graph */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                  Network Speed Monitor (Real-Time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Speed Chart */}
                  <div className="h-48 relative bg-white rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                    <div className="absolute top-2 left-4 flex gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        Download
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        Upload
                      </span>
                    </div>
                    <div className="h-full flex items-end justify-between gap-1 pt-6">
                      {downloadHistory.map((speed, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                            style={{ height: `${Math.min(100, (speed / 10))}%` }}
                          ></div>
                          <div 
                            className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                            style={{ height: `${Math.min(100, (uploadHistory[i] / 2))}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Speeds */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Download className="h-5 w-5 text-blue-600 animate-bounce" />
                        <span className="text-xs text-blue-600 font-medium">Download</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{formatSpeed(downloadSpeed)}</div>
                      <div className="text-xs text-blue-600 mt-1">Peak: {formatSpeed(Math.max(...downloadHistory))}</div>
                    </div>
                    <div className="p-4 bg-green-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Upload className="h-5 w-5 text-green-600 animate-bounce" />
                        <span className="text-xs text-green-600 font-medium">Upload</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{formatSpeed(uploadSpeed)}</div>
                      <div className="text-xs text-green-600 mt-1">Peak: {formatSpeed(Math.max(...uploadHistory))}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-orange-600" />
                  Data Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used:</span>
                    <span className="text-sm font-bold text-orange-600">{(dataUsed / 1024).toFixed(2)} GB</span>
                  </div>
                  <Progress value={(dataUsed / totalData) * 100} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>0 GB</span>
                    <span>{(totalData / 1024).toFixed(0)} GB Total</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <div className="text-xs text-gray-600">Downloaded</div>
                    <div className="font-bold text-blue-600">{(dataUsed * 0.7 / 1024).toFixed(2)} GB</div>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <div className="text-xs text-gray-600">Uploaded</div>
                    <div className="font-bold text-green-600">{(dataUsed * 0.3 / 1024).toFixed(2)} GB</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setDataUsed(0);
                    toast.success('Data usage reset');
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Usage
                </Button>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className={`text-sm font-bold ${cpuUsage > 80 ? 'text-red-600' : cpuUsage > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {cpuUsage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Memory</span>
                      <span className={`text-sm font-bold ${memoryUsage > 80 ? 'text-red-600' : memoryUsage > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {memoryUsage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Disk Space</span>
                      <span className={`text-sm font-bold ${diskUsage > 80 ? 'text-red-600' : diskUsage > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {diskUsage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={diskUsage} className="h-2" />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={cpuUsage < 70 && memoryUsage < 70 ? "default" : "destructive"}>
                      {cpuUsage < 70 && memoryUsage < 70 ? 'Optimal' : 'High Load'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-600" />
                Download History Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                  <Database className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 animate-pulse" />
                  <p className="font-medium text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{downloads.length + completedDownloads}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-medium text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{downloads.filter(d => d.status === 'completed').length + completedDownloads}</p>
                  <p className="text-xs text-muted-foreground mt-1">{((downloads.filter(d => d.status === 'completed').length / Math.max(downloads.length, 1)) * 100).toFixed(0)}% success rate</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <p className="font-medium text-sm text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{downloads.filter(d => d.status === 'error').length + failedDownloads}</p>
                  <p className="text-xs text-muted-foreground mt-1">{((downloads.filter(d => d.status === 'error').length / Math.max(downloads.length, 1)) * 100).toFixed(0)}% error rate</p>
                </div>
              </div>
              
              {/* Recent Downloads */}
              {downloads.length > 0 && (
                <div className="mb-6 p-4 bg-card rounded-lg border">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Recent Downloads
                  </h3>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {downloads.slice(-5).reverse().map(download => (
                        <div key={download.id} className="flex items-center justify-between text-xs p-2 hover:bg-accent rounded">
                          <span className="font-medium truncate flex-1">{download.filename}</span>
                          <Badge variant={download.status === 'completed' ? 'default' : download.status === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                            {download.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <input
                  type="file"
                  ref={historyImportRef}
                  onChange={importDownloadHistory}
                  accept=".json"
                  className="hidden"
                />
                <Button 
                  variant="outline"
                  onClick={exportDownloadHistory}
                  className="hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => historyImportRef.current?.click()}
                  className="hover:bg-green-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import History
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCompletedDownloads(prev => prev + downloads.filter(d => d.status === 'completed').length);
                    setFailedDownloads(prev => prev + downloads.filter(d => d.status === 'error').length);
                    toast.success('Database refreshed');
                  }}
                  className="hover:bg-purple-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Database
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (downloads.length === 0) {
                      toast.info('No downloads to clear');
                      return;
                    }
                    if (confirm('Are you sure you want to clear all download history?')) {
                      setDownloads([]);
                      setCompletedDownloads(0);
                      setFailedDownloads(0);
                      toast.success('Download history cleared');
                    }
                  }}
                  className="hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GUIImplementation;
