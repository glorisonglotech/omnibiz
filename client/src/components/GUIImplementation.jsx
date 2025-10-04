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
  AlertTriangle
} from 'lucide-react';
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
  const [downloads, setDownloads] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [speedLimit, setSpeedLimit] = useState([1000]); // KB/s
  const [maxConnections, setMaxConnections] = useState([5]);
  const [autoRetry, setAutoRetry] = useState(true);
  const [validateFiles, setValidateFiles] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('downloads');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setDownloadSpeed(Math.random() * 1000);
      setUploadSpeed(Math.random() * 100);
      setBatteryLevel(prev => Math.max(0, prev - Math.random() * 0.1));
      setSignalStrength(Math.floor(Math.random() * 5));
      
      // Update download progress
      setDownloads(prev => prev.map(download => ({
        ...download,
        progress: Math.min(100, download.progress + Math.random() * 2)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addDownload = (url, filename) => {
    const newDownload = {
      id: Date.now(),
      url,
      filename: filename || `file_${Date.now()}.zip`,
      progress: 0,
      speed: 0,
      size: Math.floor(Math.random() * 1000) + 100, // MB
      status: 'downloading',
      protocol: url.includes('torrent') ? 'BitTorrent' : 'HTTP',
      eta: '00:00:00'
    };
    
    setDownloads(prev => [...prev, newDownload]);
    toast.success(`Download started: ${newDownload.filename}`);
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
      addDownload(`file://${file.name}`, file.name);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Download Manager</h1>
        <p className="text-gray-600 mt-2">Qt-inspired GUI with advanced features</p>
      </div>

      {/* Status Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center gap-2">
                {getSignalIcon()}
                <span className="text-sm">Signal: {signalStrength}/4</span>
              </div>
              <div className="flex items-center gap-2">
                {getBatteryIcon()}
                <span className="text-sm">{batteryLevel.toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{formatSpeed(downloadSpeed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-500" />
                <span className="text-sm">{formatSpeed(uploadSpeed)}</span>
              </div>
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="text-sm">{volume[0]}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="media">Media Player</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="downloads" className="space-y-6">
          {/* Download Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input 
                  placeholder="Enter URL or magnet link..." 
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      addDownload(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Files
                </Button>
                <Button variant="outline">
                  <Folder className="h-4 w-4 mr-2" />
                  Browse
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speed Limiting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Speed Limiting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Download Speed: {speedLimit[0]} KB/s
                  </label>
                  <Slider
                    value={speedLimit}
                    onValueChange={setSpeedLimit}
                    max={10000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Connections: {maxConnections[0]}
                  </label>
                  <Slider
                    value={maxConnections}
                    onValueChange={setMaxConnections}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Retry</p>
                    <p className="text-sm text-gray-500">Automatically retry failed downloads</p>
                  </div>
                  <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">File Validation</p>
                    <p className="text-sm text-gray-500">Verify file integrity after download</p>
                  </div>
                  <Switch checked={validateFiles} onCheckedChange={setValidateFiles} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compression</p>
                    <p className="text-sm text-gray-500">Enable compression for transfers</p>
                  </div>
                  <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Encryption</p>
                    <p className="text-sm text-gray-500">Encrypt downloads for security</p>
                  </div>
                  <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Media Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Monitor className="h-16 w-16 text-gray-400" />
                </div>
                <p className="font-medium">{currentTrack || 'No media selected'}</p>
                <p className="text-sm text-gray-500">Ready to play</p>
              </div>

              <div className="space-y-4">
                <Progress value={playbackProgress} className="h-2" />
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 w-12">{volume[0]}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Download History Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Total Downloads</p>
                  <p className="text-2xl font-bold text-blue-600">{downloads.length + 247}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">234</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-600">13</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export History
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import History
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Database
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
