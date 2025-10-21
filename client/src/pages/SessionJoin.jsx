import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, Users, 
  Phone, Clock, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';

const SessionJoin = () => {
  const { accessLink } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inSession, setInSession] = useState(false);
  
  const [participantInfo, setParticipantInfo] = useState({
    email: '',
    name: '',
    password: ''
  });
  
  const [mediaSettings, setMediaSettings] = useState({
    videoEnabled: true,
    audioEnabled: true
  });

  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const peerConnections = useRef({});
  const localStream = useRef(null);

  useEffect(() => {
    fetchSessionInfo();
  }, [accessLink]);

  useEffect(() => {
    if (inSession && socket) {
      initializeWebRTC();
      setupSocketListeners();
    }

    return () => {
      cleanup();
    };
  }, [inSession, socket]);

  const fetchSessionInfo = async () => {
    try {
      const response = await api.get(`/sessions/join/${accessLink}`);
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch session error:', error);
      toast.error('Session not found');
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!participantInfo.email || !participantInfo.name) {
      toast.error('Email and name are required');
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/sessions/${accessLink}/join`, participantInfo);
      
      if (response.data.status === 'waiting') {
        toast.info(response.data.message);
        setJoining(false);
        return;
      }

      if (response.data.status === 'joined') {
        setInSession(true);
        setSession(prev => ({ ...prev, ...response.data.session }));
        toast.success('Joined session successfully!');
      }
    } catch (error) {
      console.error('Join session error:', error);
      toast.error(error.response?.data?.error || 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: mediaSettings.videoEnabled,
        audio: mediaSettings.audioEnabled
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join WebRTC room
      socket.emit('webrtc:join-room', {
        roomId: session.webrtcRoomId,
        userId: participantInfo.email,
        userName: participantInfo.name,
        callType: 'video'
      });

    } catch (error) {
      console.error('Media access error:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const setupSocketListeners = () => {
    socket.on('webrtc:joined-room', handleJoinedRoom);
    socket.on('webrtc:user-joined', handleUserJoined);
    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:user-left', handleUserLeft);
    socket.on('session_ended', handleSessionEnded);
  };

  const handleJoinedRoom = (data) => {
    console.log('Joined room:', data);
    // Create peer connections for existing participants
    data.participants.forEach(participant => {
      createPeerConnection(participant.socketId, true);
    });
  };

  const handleUserJoined = (data) => {
    console.log('User joined:', data);
    toast.info(`${data.userName} joined`);
    createPeerConnection(data.socketId, false);
  };

  const createPeerConnection = async (socketId, isInitiator) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnections.current[socketId] = peerConnection;

    // Add local stream tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream.current);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteVideosRef.current[socketId]) {
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.srcObject = remoteStream;
        videoElement.className = 'w-full h-full object-cover rounded';
        document.getElementById('remote-videos')?.appendChild(videoElement);
        remoteVideosRef.current[socketId] = videoElement;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          to: socketId,
          candidate: event.candidate,
          roomId: session.webrtcRoomId
        });
      }
    };

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('webrtc:offer', {
        to: socketId,
        offer,
        roomId: session.webrtcRoomId
      });
    }
  };

  const handleOffer = async (data) => {
    const peerConnection = peerConnections.current[data.from];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('webrtc:answer', {
        to: data.from,
        answer,
        roomId: session.webrtcRoomId
      });
    }
  };

  const handleAnswer = async (data) => {
    const peerConnection = peerConnections.current[data.from];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    const peerConnection = peerConnections.current[data.from];
    if (peerConnection && data.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleUserLeft = (data) => {
    console.log('User left:', data);
    // Clean up peer connection
    if (peerConnections.current[data.socketId]) {
      peerConnections.current[data.socketId].close();
      delete peerConnections.current[data.socketId];
    }
    // Remove video element
    if (remoteVideosRef.current[data.socketId]) {
      remoteVideosRef.current[data.socketId].remove();
      delete remoteVideosRef.current[data.socketId];
    }
  };

  const handleSessionEnded = () => {
    toast.info('Session has ended');
    cleanup();
    navigate('/');
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaSettings(prev => ({ ...prev, videoEnabled: videoTrack.enabled }));
        socket.emit('webrtc:toggle-video', { enabled: videoTrack.enabled });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaSettings(prev => ({ ...prev, audioEnabled: audioTrack.enabled }));
        socket.emit('webrtc:toggle-audio', { enabled: audioTrack.enabled });
      }
    }
  };

  const leaveSession = () => {
    socket.emit('webrtc:end-call');
    cleanup();
    navigate('/');
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    // Remove video elements
    Object.values(remoteVideosRef.current).forEach(video => video.remove());
    remoteVideosRef.current = {};
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>This session link is invalid or has expired</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!inSession) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{session.title}</CardTitle>
            <CardDescription>
              {session.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{new Date(session.scheduledStartTime).toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{session.currentParticipants} / {session.maxParticipants} participants</span>
            </div>

            <Badge>{session.sessionType}</Badge>

            <div className="space-y-3">
              <div>
                <Label>Your Name *</Label>
                <Input
                  value={participantInfo.name}
                  onChange={(e) => setParticipantInfo({ ...participantInfo, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label>Your Email *</Label>
                <Input
                  type="email"
                  value={participantInfo.email}
                  onChange={(e) => setParticipantInfo({ ...participantInfo, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              {session.requiresPassword && (
                <div>
                  <Label>Session Password</Label>
                  <Input
                    type="password"
                    value={participantInfo.password}
                    onChange={(e) => setParticipantInfo({ ...participantInfo, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
              )}

              <Button
                onClick={handleJoinSession}
                disabled={joining}
                className="w-full"
              >
                {joining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
                Join Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-4">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            You
          </div>
        </div>

        {/* Remote Videos */}
        <div id="remote-videos" className="grid grid-cols-2 gap-2">
          {/* Remote video elements will be added here dynamically */}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="text-white">
          <h3 className="font-semibold">{session.title}</h3>
          <p className="text-sm text-gray-400">Hosted by {session.host?.name}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={mediaSettings.audioEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleAudio}
          >
            {mediaSettings.audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>

          <Button
            variant={mediaSettings.videoEnabled ? 'default' : 'destructive'}
            size="icon"
            onClick={toggleVideo}
          >
            {mediaSettings.videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>

          <Button
            variant="destructive"
            onClick={leaveSession}
          >
            <Phone className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionJoin;
