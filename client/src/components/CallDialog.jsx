import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';
import webrtcService from '@/services/webrtcService';
import { toast } from 'sonner';

/**
 * CallDialog Component
 * Unified component for voice and video calls in both dashboard and storefront
 */
export default function CallDialog({ 
  isOpen, 
  onClose, 
  callType = 'video', // 'video' or 'audio'
  participant, // { id, name, email, avatar }
  user, // Current user
  token // Auth token
}) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  // Generate room ID from user IDs (sorted to ensure same room for both parties)
  const roomId = [user?.id || user?._id, participant?.id || participant?._id]
    .sort()
    .join('_');

  // Initialize call
  useEffect(() => {
    if (!isOpen) return;

    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        
        // Initialize socket
        webrtcService.initializeSocket(token);

        // Set up callbacks
        webrtcService.onRemoteStream((socketId, stream) => {
          console.log('📥 Remote stream received:', socketId);
          setRemoteStreams(prev => new Map(prev).set(socketId, stream));
          setIsConnecting(false);
          
          // Display remote stream
          const videoElement = remoteVideoRefs.current.get(socketId);
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        });

        webrtcService.onRemoteStreamRemoved((socketId) => {
          console.log('📤 Remote stream removed:', socketId);
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(socketId);
            return newMap;
          });
        });

        webrtcService.onCallEnded(() => {
          console.log('📞 Call ended by remote peer');
          handleEndCall();
        });

        // Start call
        const stream = await webrtcService.startCall(
          roomId,
          user?.id || user?._id,
          user?.name || user?.email,
          callType
        );

        setLocalStream(stream);
        setCallActive(true);
        callStartTime.current = Date.now();

        // Display local stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Start duration counter
        durationInterval.current = setInterval(() => {
          if (callStartTime.current) {
            setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
          }
        }, 1000);

        toast.success(`${callType === 'video' ? 'Video' : 'Voice'} call started`);
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to start call:', error);
        toast.error('Failed to start call. Please check your camera/microphone permissions.');
        setIsConnecting(false);
        onClose();
      }
    };

    initializeCall();

    // Cleanup on unmount or close
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isOpen, roomId, token, user, callType]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        webrtcService.toggleAudio(audioTrack.enabled);
        toast.info(audioTrack.enabled ? 'Microphone on' : 'Microphone off');
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        webrtcService.toggleVideo(videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  };

  // End call
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    webrtcService.endCall();
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    setLocalStream(null);
    setRemoteStreams(new Map());
    setCallActive(false);
    setCallDuration(0);
    callStartTime.current = null;
    
    toast.info('Call ended');
    onClose();
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-full h-screen' : 'max-w-4xl'} p-0`}>
        <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
          {/* Call Header */}
          <DialogHeader className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant?.avatar} />
                  <AvatarFallback>
                    {participant?.name?.[0] || participant?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-white">
                    {participant?.name || participant?.email || 'Unknown'}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {isConnecting ? (
                      <Badge variant="secondary" className="text-xs">Connecting...</Badge>
                    ) : callActive ? (
                      <>
                        <Badge variant="default" className="bg-green-500 text-xs">Connected</Badge>
                        <span>{formatDuration(callDuration)}</span>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Waiting...</Badge>
                    )}
                  </div>
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
              </div>
            </div>
          </DialogHeader>

          {/* Video/Audio Container */}
          <div className="flex-1 relative bg-gray-800 overflow-hidden">
            {callType === 'video' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                {/* Remote Video (Main) */}
                {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
                  <div key={socketId} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={(el) => {
                        if (el) {
                          remoteVideoRefs.current.set(socketId, el);
                          el.srcObject = stream;
                        }
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {participant?.name || 'Participant'}
                    </div>
                  </div>
                ))}

                {/* Local Video (Picture-in-Picture) */}
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    You {!videoEnabled && '(Video Off)'}
                  </div>
                </div>
              </div>
            ) : (
              // Audio call - show avatars
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-8">
                  <Avatar className="h-32 w-32 mx-auto">
                    <AvatarImage src={participant?.avatar} />
                    <AvatarFallback className="text-4xl">
                      {participant?.name?.[0] || participant?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-semibold">{participant?.name || participant?.email}</h3>
                    <p className="text-gray-400 mt-2">{formatDuration(callDuration)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-center gap-4">
              {/* Microphone Toggle */}
              <Button
                variant={audioEnabled ? "secondary" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleAudio}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              {/* Video Toggle (only for video calls) */}
              {callType === 'video' && (
                <Button
                  variant={videoEnabled ? "secondary" : "destructive"}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={toggleVideo}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              )}

              {/* End Call */}
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              {/* Settings (placeholder) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full text-white hover:bg-gray-800"
                onClick={() => toast.info('Settings - Coming soon')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

