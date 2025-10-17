import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import webrtcService from '@/services/webrtcService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/**
 * VideoCall Component
 * Provides video/audio calling functionality
 */
export default function VideoCall({ roomId, onCallEnd, callType = 'video' }) {
  const { user, token } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
  const [callActive, setCallActive] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Initialize socket
        webrtcService.initializeSocket(token);

        // Start call
        const stream = await webrtcService.startCall(
          roomId,
          user.id,
          user.name,
          callType
        );

        setLocalStream(stream);
        setCallActive(true);

        // Display local stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        toast.success('Call started');
      } catch (error) {
        console.error('Failed to start call:', error);
        toast.error('Failed to start call. Please check your camera/microphone permissions.');
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      handleEndCall();
    };
  }, [roomId, token, user, callType]);

  // Handle remote streams
  useEffect(() => {
    webrtcService.onRemoteStream((socketId, stream) => {
      console.log('Remote stream received:', socketId);
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(socketId, stream);
        return newStreams;
      });

      // Display remote stream
      setTimeout(() => {
        const videoElement = remoteVideoRefs.current.get(socketId);
        if (videoElement && stream) {
          videoElement.srcObject = stream;
        }
      }, 100);
    });

    webrtcService.onRemoteStreamRemoved((socketId) => {
      console.log('Remote stream removed:', socketId);
      
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(socketId);
        return newStreams;
      });
    });

    webrtcService.onCallEnded(() => {
      handleCallEnded();
    });
  }, []);

  // Toggle audio
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    webrtcService.toggleAudio(newState);
  };

  // Toggle video
  const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    webrtcService.toggleVideo(newState);
  };

  // End call
  const handleEndCall = () => {
    webrtcService.endCall();
    handleCallEnded();
  };

  // Handle call ended
  const handleCallEnded = () => {
    setCallActive(false);
    setLocalStream(null);
    setRemoteStreams(new Map());
    
    if (onCallEnd) {
      onCallEnd();
    }
  };

  if (!callActive) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Call ended</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <Card>
          <CardContent className="p-2">
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
          </CardContent>
        </Card>

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
          <Card key={socketId}>
            <CardContent className="p-2">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(socketId, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Participant
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state if no remote streams */}
        {remoteStreams.size === 0 && (
          <Card>
            <CardContent className="p-2">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Waiting for others to join...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <Button
              onClick={toggleAudio}
              variant={audioEnabled ? 'default' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
            >
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            {/* Video Toggle */}
            {callType === 'video' && (
              <Button
                onClick={toggleVideo}
                variant={videoEnabled ? 'default' : 'destructive'}
                size="lg"
                className="rounded-full w-14 h-14"
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}

            {/* End Call */}
            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Room ID: {roomId}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {remoteStreams.size === 0 
                ? 'Waiting for participants...' 
                : `${remoteStreams.size} participant(s) in call`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
