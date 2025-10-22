import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, Users, Calendar, Clock, Link2, Mail, Copy, Check,
  Play, StopCircle, UserPlus, Settings, Share2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { Link } from "react-router-dom";

const LiveSessions = () => {
  const { socket } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sessionType: 'meeting',
    scheduledStartTime: '',
    scheduledEndTime: '',
    participants: [],
    maxParticipants: 100,
    enableRecording: false,
    waitingRoomEnabled: false
  });

  const [newParticipant, setNewParticipant] = useState({ email: '', name: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('session_started', handleSessionStarted);
      socket.on('session_ended', handleSessionEnded);
      socket.on('participant_joined', handleParticipantJoined);

      return () => {
        socket.off('session_started');
        socket.off('session_ended');
        socket.off('participant_joined');
      };
    }
  }, [socket]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Fetch sessions error:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!formData.title || !formData.scheduledStartTime || !formData.scheduledEndTime) {
        toast.error('Title, start time, and end time are required');
        return;
      }

      // Validate start and end times
      const startTime = new Date(formData.scheduledStartTime);
      const endTime = new Date(formData.scheduledEndTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        toast.error('Invalid date format for start or end time');
        return;
      }

      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        return;
      }

      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants, 10) || 100,
        scheduledStartTime: startTime.toISOString(),
        scheduledEndTime: endTime.toISOString()
      };

      const response = await api.post('/sessions', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessions([response.data, ...sessions]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Session created and invitations sent!');
    } catch (error) {
      console.error('Create session error:', error);
      toast.error(error.response?.data?.error || 'Failed to create session');
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/sessions/${sessionId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessions(sessions.map(s => s._id === sessionId ? response.data : s));
      toast.success('Session started! Participants have been notified.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/sessions/${sessionId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessions(sessions.map(s => s._id === sessionId ? response.data : s));
      toast.success('Session ended');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  const handleCopyLink = (session) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/session/join/${session.accessLink}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(session._id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const addParticipant = () => {
    if (!newParticipant.email || !newParticipant.name) {
      toast.error('Email and name are required');
      return;
    }
    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant]
    });
    setNewParticipant({ email: '', name: '' });
  };

  const removeParticipant = (index) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sessionType: 'meeting',
      scheduledStartTime: '',
      scheduledEndTime: '',
      participants: [],
      maxParticipants: 100,
      enableRecording: false,
      waitingRoomEnabled: false
    });
  };

  const handleSessionStarted = (data) => {
    toast.success(`Session "${data.title}" has started!`);
    fetchSessions();
  };

  const handleSessionEnded = (data) => {
    toast.info('Session has ended');
    fetchSessions();
  };

  const handleParticipantJoined = (data) => {
    toast.info(`${data.participant.name} joined the session`);
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'default',
      live: 'destructive',
      ended: 'secondary',
      cancelled: 'outline'
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledStartTime) > new Date());
  const liveSessions = sessions.filter(s => s.status === 'live');
  const pastSessions = sessions.filter(s => s.status === 'ended');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Sessions & Webinars</h1>
          <p className="text-muted-foreground">Schedule and manage video sessions with clients</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Video className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Security Dashboard Link */}
      <div className="mb-4">
        <Link to="/dashboard/security-dashboard" className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5.25-3.5 10-7 10s-7-4.75-7-10V6l7-4z" /></svg>
          Security Dashboard
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({liveSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.map(session => (
            <Card key={session._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{session.title}</CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(session.scheduledStartTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(session.scheduledStartTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{session.participants.length} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{session.sessionType}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => handleStartSession(session._id)}
                    disabled={!canStart(session)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                  <Button variant="outline" onClick={() => handleCopyLink(session)}>
                    {copiedLink === session._id ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {upcomingSessions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {liveSessions.map(session => (
            <Card key={session._id} className="border-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {session.title}
                      <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="default" onClick={() => window.open(`/session/join/${session.accessLink}`, '_blank')}>
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                  <Button variant="destructive" onClick={() => handleEndSession(session._id)}>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                  <Button variant="outline" onClick={() => handleCopyLink(session)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {liveSessions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No live sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSessions.slice(0, 10).map(session => (
            <Card key={session._id}>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  {new Date(session.actualStartTime).toLocaleString()} - {session.totalDuration ? `${Math.floor(session.totalDuration / 60)} min` : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Peak participants: {session.peakParticipants}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule a Live Session</DialogTitle>
            <DialogDescription>Create a video session or webinar with clients</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Product Demo, Support Call, Training"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this session about?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Session Type</Label>
                <Select value={formData.sessionType} onValueChange={(value) => setFormData({ ...formData, sessionType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="support_call">Support Call</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value, 10) : 100 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledStartTime}
                  onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                />
              </div>

              <div>
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledEndTime}
                  onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Add Participants</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                />
                <Input
                  placeholder="Name"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                />
                <Button onClick={addParticipant}>
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              {formData.participants.length > 0 && (
                <div className="space-y-2">
                  {formData.participants.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span>{p.name} ({p.email})</span>
                      <Button variant="ghost" size="sm" onClick={() => removeParticipant(i)}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCreateSession} className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Create & Send Invites
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper to check if session can start
const canStart = (session) => {
  const now = new Date();
  const scheduledStart = new Date(session.scheduledStartTime);
  const earlyStartTime = new Date(scheduledStart.getTime() - 15 * 60 * 1000);
  return now >= earlyStartTime && session.status === 'scheduled';
};

export default LiveSessions;
