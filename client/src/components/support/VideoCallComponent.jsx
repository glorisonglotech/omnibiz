import React, { useRef, useEffect, useState } from 'react';
import { 
  Video as VideoIcon, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  X,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const VideoCallComponent = ({
  localStream,
  remoteStream,
  isVideoCall,
  isCameraOn,
  isMicOn,
  activeAgent,
  connected,
  onToggleCamera,
  onToggleMicrophone,
  onEndCall
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    if (isVideoCall) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [isVideoCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isVideoCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl mx-4 h-[90vh] flex flex-col">
        {/* Video Call Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeAgent?.avatar} />
                <AvatarFallback>
                  {activeAgent?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold">{activeAgent?.name}</p>
              <p className="text-xs text-gray-400">In call • {formatDuration(callDuration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFullscreen}
              className="text-white hover:bg-gray-800"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" onClick={onEndCall}>
              <X className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        </div>

        {/* Video Streams Container */}
        <div className="flex-1 relative bg-gray-800 rounded-b-lg overflow-hidden">
          {/* Remote Video (Main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Remote video placeholder */}
          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <Avatar className="h-32 w-32 mb-4 shadow-2xl">
                <AvatarImage src={activeAgent?.avatar} />
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  {activeAgent?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-lg font-medium">Connecting to {activeAgent?.name}...</p>
              <div className="flex gap-2 mt-4">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-24 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600 shadow-2xl">
            {isCameraOn ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                  You
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">Camera Off</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-900 bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl">
            <Button
              variant={isMicOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12 transition-all hover:scale-110"
              onClick={onToggleMicrophone}
              title={isMicOn ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isCameraOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12 transition-all hover:scale-110"
              onClick={onToggleCamera}
              title={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 transition-all hover:scale-110"
              onClick={onEndCall}
              title="End call"
            >
              <Phone className="h-6 w-6 rotate-135" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-12 h-12 transition-all hover:scale-110"
              onClick={() => toast.info('Settings coming soon')}
              title="Call settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Connection Status Indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black bg-opacity-70 backdrop-blur-sm px-3 py-2 rounded-full">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-white font-medium">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Call Duration Badge */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-xs text-white font-mono font-medium">
              {formatDuration(callDuration)}
            </span>
          </div>

          {/* Connection Quality (Optional) */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 backdrop-blur-sm px-3 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-green-500 rounded" />
                <div className="w-1 h-4 bg-green-500 rounded" />
                <div className="w-1 h-5 bg-green-500 rounded" />
              </div>
              <span className="text-xs text-white">HD Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallComponent;
