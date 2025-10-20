import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Send, Mail, Phone, AlertCircle, CheckCircle, Clock, 
  Star, ThumbsUp, ThumbsDown, Video, FileText, User, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';

const FeedbackSystem = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { socket, connected } = useSocket();

  const [formData, setFormData] = useState({
    type: 'feedback', // feedback, complaint, suggestion, question
    category: 'general',
    subject: '',
    message: '',
    name: '',
    email: '',
    phone: '',
    priority: 'normal',
    contactMethod: 'email'
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Real-time feedback updates
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('feedback_created', (data) => {
      setFeedbackList(prev => [data.feedback, ...prev]);
      toast.success('New feedback received');
    });

    socket.on('feedback_updated', (data) => {
      setFeedbackList(prev => prev.map(f => 
        f._id === data.feedback._id ? data.feedback : f
      ));
      if (selectedFeedback?._id === data.feedback._id) {
        setSelectedFeedback(data.feedback);
      }
    });

    return () => {
      socket.off('feedback_created');
      socket.off('feedback_updated');
    };
  }, [socket, connected, selectedFeedback]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await api.get('/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackList(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/feedback', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Feedback submitted successfully!');
      setFeedbackList(prev => [data.feedback, ...prev]);
      setShowFeedbackForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error('Error:', error);
    }
  };

  const handleResponse = async (feedbackId, response) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/feedback/${feedbackId}/response`, 
        { response, status: 'resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Response sent successfully');
      fetchFeedback();
    } catch (error) {
      toast.error('Failed to send response');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'feedback',
      category: 'general',
      subject: '',
      message: '',
      name: '',
      email: '',
      phone: '',
      priority: 'normal',
      contactMethod: 'email'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={styles[status] || styles.pending}>{status}</Badge>;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'complaint': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'feedback': return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'suggestion': return <ThumbsUp className="h-5 w-5 text-green-600" />;
      case 'question': return <FileText className="h-5 w-5 text-purple-600" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support & Feedback System</h2>
          <p className="text-muted-foreground">
            Manage client feedback, complaints, and support requests
          </p>
        </div>
        <Button onClick={() => setShowFeedbackForm(true)}>
          <Send className="mr-2 h-4 w-4" />
          New Feedback
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{feedbackList.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {feedbackList.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {feedbackList.filter(f => f.status === 'in_progress').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">
                  {feedbackList.filter(f => f.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback & Support Requests</CardTitle>
          <CardDescription>
            Real-time updates • {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="complaint">Complaints</TabsTrigger>
              <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {feedbackList.map((feedback) => (
                <Card key={feedback._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFeedback(feedback)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {getTypeIcon(feedback.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{feedback.subject}</h3>
                          {getStatusBadge(feedback.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {feedback.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {feedback.name || feedback.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {feedback.email}
                          </span>
                          {feedback.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {feedback.phone}
                            </span>
                          )}
                          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feedback Form Dialog */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your feedback"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Detailed message..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone (Optional)</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 XXX XXX XXX"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFeedbackForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Feedback Detail Dialog */}
      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedFeedback.type)}
                {selectedFeedback.subject}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedFeedback.status)}
                <Badge variant="outline">{selectedFeedback.priority} priority</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Message:</h4>
                <p className="text-muted-foreground">{selectedFeedback.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Contact Information:</p>
                  <p className="text-sm">{selectedFeedback.name}</p>
                  <p className="text-sm">{selectedFeedback.email}</p>
                  {selectedFeedback.phone && <p className="text-sm">{selectedFeedback.phone}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium">Submitted:</p>
                  <p className="text-sm">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Response Section */}
              {selectedFeedback.response && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Response:</h4>
                  <p className="text-sm text-green-700">{selectedFeedback.response}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                  Close
                </Button>
                {selectedFeedback.status !== 'resolved' && (
                  <Button onClick={() => {
                    const response = prompt('Enter your response:');
                    if (response) {
                      handleResponse(selectedFeedback._id, response);
                      setSelectedFeedback(null);
                    }
                  }}>
                    Send Response
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeedbackSystem;
