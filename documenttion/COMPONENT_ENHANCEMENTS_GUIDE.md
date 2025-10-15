# Component Enhancements Guide

## Overview
This guide documents the enhancements needed for Help & Support, GUI Demo, and Reports components to add real-time functionality and fix non-working features.

---

## 1. Help & Support Component (`/dashboard/support`)

### Current Status
✅ Basic chat interface exists
✅ FAQ section exists  
✅ Ticket listing exists
✅ Contact form exists
❌ No real-time messaging
❌ Video call is simulated
❌ Ticket creation not functional
❌ FAQ interactions don't work

### Required Enhancements

#### A. Real-Time Chat with WebSocket

**Add to imports:**
```javascript
import { useSocket } from '@/context/SocketContext';
```

**Add state variables:**
```javascript
const socket = useSocket();
```

**Add WebSocket initialization:**
```javascript
useEffect(() => {
  if (!socket) return;

  // Join support channel
  socket.emit('join_support_chat', { userId: user?._id });

  // Listen for new messages
  socket.on('support_message', (message) => {
    setChatMessages(prev => [...prev, message]);
  });

  // Listen for agent typing
  socket.on('agent_typing', (data) => {
    setIsTyping(data.isTyping);
  });

  // Listen for agent status
  socket.on('agent_status_change', (data) => {
    setSupportAgents(prev => prev.map(agent => 
      agent.id === data.agentId ? { ...agent, status: data.status } : agent
    ));
  });

  return () => {
    socket.off('support_message');
    socket.off('agent_typing');
    socket.off('agent_status_change');
  };
}, [socket]);
```

**Update sendMessage function:**
```javascript
const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const message = {
    id: Date.now(),
    sender: 'user',
    message: newMessage,
    timestamp: new Date(),
    userId: user?._id
  };

  // Send via WebSocket for real-time
  if (socket) {
    socket.emit('send_support_message', message);
  }

  setChatMessages(prev => [...prev, message]);
  setNewMessage('');

  // Also save to database
  try {
    await supportAPI.sendMessage(activeAgent?.id, newMessage);
  } catch (error) {
    console.error('Failed to save message:', error);
  }
};
```

#### B. Working Video Call

**Add video refs:**
```javascript
const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const [videoStream, setVideoStream] = useState(null);
const [isCameraOn, setIsCameraOn] = useState(true);
const [isMicOn, setIsMicOn] = useState(true);
```

**Update startVideoCall:**
```javascript
const startVideoCall = async () => {
  try {
    // Request camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    setVideoStream(stream);
    setIsVideoCall(true);
    
    // Set local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // Notify server
    if (socket) {
      socket.emit('start_video_call', {
        userId: user?._id,
        agentId: activeAgent?.id
      });
    }

    toast.success('Video call started with ' + activeAgent?.name);
  } catch (error) {
    console.error('Error starting video call:', error);
    toast.error('Failed to access camera/microphone. Check permissions.');
  }
};
```

**Add camera/mic toggle:**
```javascript
const toggleCamera = () => {
  if (videoStream) {
    const videoTrack = videoStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  }
};

const toggleMicrophone = () => {
  if (videoStream) {
    const audioTrack = videoStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }
};
```

**Update video call modal:**
```javascript
{isVideoCall && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
    <Card className="w-full max-w-5xl mx-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            Video Call with {activeAgent?.name}
          </CardTitle>
          <Button variant="destructive" onClick={endVideoCall}>
            End Call
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Remote Video */}
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <video 
              ref={remoteVideoRef}
              autoPlay 
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Local Video */}
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Video Controls */}
        <div className="flex justify-center gap-4">
          <Button 
            variant={isCameraOn ? "secondary" : "destructive"}
            onClick={toggleCamera}
          >
            {isCameraOn ? <VideoIcon /> : <VideoOff />}
          </Button>
          <Button 
            variant={isMicOn ? "secondary" : "destructive"}
            onClick={toggleMicrophone}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

#### C. Working Ticket Creation

**Add Dialog component:**
```javascript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
```

**Add state:**
```javascript
const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
const [newTicket, setNewTicket] = useState({ 
  subject: '', 
  description: '', 
  priority: 'medium' 
});
```

**Add create function:**
```javascript
const createTicket = async () => {
  if (!newTicket.subject.trim() || !newTicket.description.trim()) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    const ticket = await supportAPI.createTicket({
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      userId: user?._id
    });

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', description: '', priority: 'medium' });
    setIsCreateTicketOpen(false);
    toast.success('Support ticket created successfully!');
  } catch (error) {
    console.error('Error creating ticket:', error);
    toast.error('Failed to create ticket.');
  }
};
```

**Update button:**
```javascript
<Dialog open={isCreateTicketOpen} onValueChange={setIsCreateTicketOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Create New Ticket
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Support Ticket</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        placeholder="Subject"
        value={newTicket.subject}
        onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
      />
      <Select 
        value={newTicket.priority} 
        onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Description"
        value={newTicket.description}
        onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
        rows={5}
      />
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
        Cancel
      </Button>
      <Button onClick={createTicket}>Create Ticket</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### D. Working FAQ Interactions

**Add function:**
```javascript
const markFAQHelpful = async (faqId, isHelpful) => {
  try {
    setFaqItems(prev => prev.map(faq => 
      faq.id === faqId 
        ? { ...faq, helpful: faq.helpful + (isHelpful ? 1 : -1) }
        : faq
    ));
    toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded');
    
    // Optional: Save to backend
    // await supportAPI.markFAQHelpful(faqId, isHelpful);
  } catch (error) {
    console.error('Error marking FAQ:', error);
  }
};
```

**Update buttons:**
```javascript
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => markFAQHelpful(faq.id, true)}
>
  <ThumbsUp className="h-4 w-4" />
</Button>
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => markFAQHelpful(faq.id, false)}
>
  <ThumbsDown className="h-4 w-4" />
</Button>
```

#### E. Working Contact Form

**Update form:**
```javascript
<form onSubmit={sendQuickContact}>
  <Input name="subject" placeholder="Subject" required />
  <Textarea name="message" placeholder="Message" rows={4} required />
  <Button type="submit">Send Message</Button>
</form>
```

**Add handler:**
```javascript
const sendQuickContact = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    await supportAPI.createTicket({
      subject: formData.get('subject'),
      description: formData.get('message'),
      priority: 'medium',
      userId: user?._id
    });
    toast.success('Message sent! We\'ll respond shortly.');
    e.target.reset();
  } catch (error) {
    toast.error('Failed to send message.');
  }
};
```

---

## 2. GUI Demo Component (`/dashboard/gui`)

### Current Status
✅ Download manager UI exists
✅ Settings panel exists
✅ Media player exists
❌ Downloads update at random (not real)
❌ No actual file download capability
❌ Media player doesn't play files

### Required Enhancements

#### A. Real-Time Download Progress

**Update with actual file downloads:**
```javascript
const addDownload = async (url, filename) => {
  try {
    const newDownload = {
      id: Date.now(),
      url,
      filename: filename || `file_${Date.now()}.zip`,
      progress: 0,
      speed: 0,
      size: 0,
      status: 'downloading',
      startTime: Date.now()
    };
    
    setDownloads(prev => [...prev, newDownload]);

    // Start actual download with progress tracking
    const response = await fetch(url);
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    
    let receivedLength = 0;
    const chunks = [];
    
    while(true) {
      const {done, value} = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      const progress = (receivedLength / contentLength) * 100;
      const elapsed = (Date.now() - newDownload.startTime) / 1000;
      const speed = receivedLength / elapsed / 1024; // KB/s
      
      setDownloads(prev => prev.map(d => 
        d.id === newDownload.id 
          ? { ...d, progress, speed, size: contentLength }
          : d
      ));
    }
    
    // Download complete
    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.click();
    
    setDownloads(prev => prev.map(d => 
      d.id === newDownload.id 
        ? { ...d, status: 'completed', progress: 100 }
        : d
    ));
    
    toast.success('Download completed!');
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Download failed');
  }
};
```

#### B. Real Network Speed Monitoring

**Add network monitoring:**
```javascript
useEffect(() => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    const updateNetworkInfo = () => {
      setDownloadSpeed(connection.downlink * 1024); // Convert to KB/s
      setIsConnected(navigator.onLine);
    };
    
    updateNetworkInfo();
    connection.addEventListener('change', updateNetworkInfo);
    window.addEventListener('online', () => setIsConnected(true));
    window.addEventListener('offline', () => setIsConnected(false));
    
    return () => {
      connection.removeEventListener('change', updateNetworkInfo);
      window.removeEventListener('online', () => setIsConnected(true));
      window.removeEventListener('offline', () => setIsConnected(false));
    };
  }
}, []);
```

#### C. Working Media Player

**Add file support:**
```javascript
const [selectedFile, setSelectedFile] = useState(null);
const audioRef = useRef(new Audio());

const handleMediaFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audioRef.current.src = url;
    setCurrentTrack(file.name);
    setSelectedFile(file);
  }
};

const togglePlayback = () => {
  if (isPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play();
  }
  setIsPlaying(!isPlaying);
};

// Add progress tracking
useEffect(() => {
  const audio = audioRef.current;
  
  const updateProgress = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    setPlaybackProgress(progress);
  };
  
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', () => setIsPlaying(false));
  
  return () => {
    audio.removeEventListener('timeupdate', updateProgress);
    audio.removeEventListener('ended', () => setIsPlaying(false));
  };
}, []);
```

#### D. Database Export/Import

**Add real export:**
```javascript
const exportHistory = () => {
  const data = JSON.stringify(downloads, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `download-history-${Date.now()}.json`;
  a.click();
  toast.success('History exported');
};

const importHistory = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setDownloads(prev => [...prev, ...imported]);
        toast.success('History imported');
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  }
};
```

---

## 3. Reports Component - Fix Non-Working Functions

### Issues Found
✅ Report generation exists but may fail
✅ Export functions exist
✅ Schedule functions exist  
❌ May not handle errors properly
❌ Blob downloads need testing

### Fixes Already Applied

All major fixes were applied in previous updates:
- ✅ Better error handling with user-friendly messages
- ✅ Proper blob handling for downloads
- ✅ Authentication tokens in all requests
- ✅ Loading states and progress indicators
- ✅ Permission-based report filtering

### Additional Test Cases Needed

**Test report generation:**
```javascript
// Verify these scenarios:
1. Generate report with valid data → Should download PDF
2. Generate with no data → Should show appropriate message
3. Generate with API error → Should show error without crashing
4. Cancel during generation → Should stop properly
```

**Test export:**
```javascript
// Verify these scenarios:
1. Export as CSV → Should download .csv file
2. Export as PDF → Should download .pdf file with charts
3. Export with date range → Should filter correctly
4. Export with no data → Should create empty file or show message
```

**Test scheduling:**
```javascript
// Verify these scenarios:
1. Schedule daily report → Should confirm scheduling
2. Schedule with invalid email → Should validate
3. Schedule when API down → Should show error
4. View scheduled reports → Should list all schedules
```

---

## Implementation Priority

### High Priority (Do First)
1. Help & Support - Working ticket creation
2. Help & Support - Real-time chat via WebSocket
3. GUI Demo - Real download progress
4. Reports - Test all functions thoroughly

### Medium Priority (Do Next)
5. Help & Support - Working video call
6. GUI Demo - Media player functionality
7. Help & Support - FAQ interactions

### Low Priority (Nice to Have)
8. GUI Demo - Network monitoring
9. GUI Demo - Database export/import
10. Reports - Advanced filtering

---

## Testing Checklist

### Help & Support
- [ ] Send chat message → Appears in real-time
- [ ] Start video call → Camera/mic access works
- [ ] Toggle camera → Video stops/starts
- [ ] Create ticket → Ticket appears in list
- [ ] Mark FAQ helpful → Count updates
- [ ] Send contact form → Creates ticket

### GUI Demo
- [ ] Add download → Shows in list
- [ ] Download progresses → Updates in real-time
- [ ] Pause download → Stops progress
- [ ] Resume download → Continues from pause
- [ ] Play media → Audio/video plays
- [ ] Export history → Downloads JSON file

### Reports
- [ ] Generate report → Downloads PDF
- [ ] Export CSV → Downloads data
- [ ] Schedule report → Confirms scheduling
- [ ] Change filters → Updates data
- [ ] All tabs work → No errors

---

## Backend Requirements

### WebSocket Events Needed
```javascript
// Support chat
socket.on('join_support_chat')
socket.on('send_support_message')
socket.emit('support_message')
socket.emit('agent_typing')
socket.emit('agent_status_change')

// Video calls
socket.on('start_video_call')
socket.on('end_video_call')
socket.emit('video_offer')
socket.emit('video_answer')
```

### API Endpoints Needed
```javascript
// Support
POST /api/support/tickets
GET /api/support/tickets
POST /api/support/messages
GET /api/support/faqs
POST /api/support/faq/helpful

// Reports (already exist, just verify)
POST /api/reports/generate
POST /api/reports/export
POST /api/reports/schedule
```

---

## Conclusion

All three components are now documented with specific enhancements needed. The code examples provided can be integrated into the existing components to add full functionality.

**Next Steps:**
1. Implement WebSocket for real-time features
2. Add camera/microphone access for video calls
3. Test all download and report generation functions
4. Add proper error handling throughout
5. Test thoroughly before deployment

**Estimated Time:**
- Help & Support: 4-6 hours
- GUI Demo: 3-4 hours
- Reports testing: 1-2 hours
- **Total: 8-12 hours**
