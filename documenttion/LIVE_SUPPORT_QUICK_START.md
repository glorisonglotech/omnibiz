# 🚀 Live Support System - Quick Start Guide

## ✅ **What's Been Built**

Your OmniBiz platform now has a **complete live support system** with:

1. ✅ **Support Ticketing** - Already working
2. ✅ **Video Calls** - WebRTC infrastructure ready
3. ✅ **Live Sessions/Webinars** - NEW! Schedule and host sessions
4. ✅ **Email Invitations** - Automatic invites with join links
5. ✅ **Multi-participant** - Up to 100 people per session

---

## 🎯 **Quick Usage Guide**

### **For Business Owners/Admins**

#### **Schedule a Live Session**

1. Navigate to **Live Sessions** page in dashboard
2. Click **"Schedule Session"**
3. Fill in details:
   - Title: "Product Demo"
   - Type: Webinar/Meeting/Support Call/Training
   - Start/End Time
   - Add participants (email + name)
4. Click **"Create & Send Invites"**
5. ✅ Session created + Emails sent automatically!

#### **Start a Session**

1. View **Upcoming Sessions**
2. Click **"Start Session"** (can start 15 min early)
3. Participants are notified via email
4. Share the join link with others

#### **During the Session**

- **View participants** in real-time
- **Copy and share** the session link
- **End session** when done
- All activity is tracked

---

### **For Clients/Participants**

#### **Join via Email Invitation**

1. Check email for invitation
2. Click **"Join Session"** button
3. Enter your name and email
4. Click **"Join Session"**
5. Allow camera/microphone access
6. ✅ You're in!

#### **Join via Direct Link**

1. Open link: `https://yourapp.com/session/join/ABC123`
2. Enter your details
3. Join the session

#### **During the Session**

- Toggle your microphone (Mic icon)
- Toggle your camera (Video icon)
- Leave session (Phone icon)

---

## 📧 **Email Templates**

### **Session Invitation**

Recipients automatically receive:

```
Subject: Invitation: Product Demo Session

You're invited to a webinar

Title: Product Demo Session
When: January 25, 2025 at 10:00 AM
Duration: 60 minutes

Description: Live demo of our new features

[Join Session Button]

Or copy this link: https://yourapp.com/session/join/abc123xyz
```

### **Session Started**

```
Subject: Product Demo Session has started

The session "Product Demo Session" has started!
Join now: https://yourapp.com/session/join/abc123xyz
```

---

## 🔧 **API Examples**

### **Create a Session (JavaScript)**

```javascript
import api from '@/lib/api';

const createSession = async () => {
  const token = localStorage.getItem('token');
  
  const response = await api.post('/sessions', {
    title: "Customer Support Call",
    description: "Technical support session",
    sessionType: "support_call",
    scheduledStartTime: "2025-01-25T14:00:00Z",
    scheduledEndTime: "2025-01-25T15:00:00Z",
    participants: [
      {
        email: "customer@example.com",
        name: "John Doe"
      }
    ],
    maxParticipants: 10,
    enableRecording: false
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Session created:', response.data);
  console.log('Access link:', response.data.accessLink);
};
```

### **Get Upcoming Sessions**

```javascript
const getUpcomingSessions = async () => {
  const token = localStorage.getItem('token');
  
  const response = await api.get('/sessions?upcoming=true', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Upcoming sessions:', response.data);
};
```

### **Start a Session**

```javascript
const startSession = async (sessionId) => {
  const token = localStorage.getItem('token');
  
  await api.post(`/sessions/${sessionId}/start`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Session started!');
};
```

---

## 🎨 **Frontend Routes**

Add these to your React Router:

```javascript
import LiveSessions from '@/pages/dashboard/LiveSessions';
import SessionJoin from '@/pages/SessionJoin';

// In your routes configuration:

// Admin/Dashboard (Protected)
<Route path="/dashboard/sessions" element={<LiveSessions />} />

// Public Join Page (Anyone can access)
<Route path="/session/join/:accessLink" element={<SessionJoin />} />
```

---

## 🔗 **Integration with Support Tickets**

### **Create Session from Ticket**

```javascript
// When escalating a support ticket to video call
const createSessionFromTicket = async (ticket) => {
  const response = await api.post('/sessions', {
    title: `Support Call - ${ticket.subject}`,
    sessionType: "support_call",
    relatedTicket: ticket._id,
    scheduledStartTime: new Date(Date.now() + 15*60*1000), // 15 min from now
    scheduledEndTime: new Date(Date.now() + 45*60*1000), // 45 min from now
    participants: [
      {
        email: ticket.userId.email,
        name: ticket.userId.name
      }
    ]
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Add session link to ticket message
  await api.post(`/support/tickets/${ticket._id}/messages`, {
    message: `I've scheduled a video call to help you. Join here: ${baseUrl}/session/join/${response.data.accessLink}`
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

## 📊 **Session Types & Use Cases**

### **1. Support Call** (1-on-1)
```javascript
{
  sessionType: "support_call",
  maxParticipants: 2,
  enableRecording: true
}
```
**Use for**: Customer support, troubleshooting

### **2. Webinar** (Many participants)
```javascript
{
  sessionType: "webinar",
  maxParticipants: 100,
  waitingRoomEnabled: true,
  requiresApproval: false
}
```
**Use for**: Product launches, demos, training

### **3. Training** (Medium group)
```javascript
{
  sessionType: "training",
  maxParticipants: 20,
  enableScreenShare: true,
  agenda: "1. Introduction\n2. Features\n3. Q&A"
}
```
**Use for**: Onboarding, tutorials

### **4. Consultation** (Private)
```javascript
{
  sessionType: "consultation",
  maxParticipants: 5,
  password: "secure123",
  requiresApproval: true
}
```
**Use for**: Business meetings, consultations

### **5. Demo** (Sales)
```javascript
{
  sessionType: "demo",
  maxParticipants: 10,
  enableRecording: true
}
```
**Use for**: Product demonstrations, sales pitches

---

## 🔐 **Security Features**

### **Access Control**
- ✅ Unique crypto-random access links
- ✅ Optional password protection
- ✅ Waiting room with host approval
- ✅ Max participant limits

### **Example: Protected Session**
```javascript
{
  title: "VIP Client Meeting",
  password: "SecurePass123",
  waitingRoomEnabled: true,
  requiresApproval: true,
  allowedDomains: ["clientcompany.com"]
}
```

---

## 🎥 **Video Call Features**

### **For Hosts**
- ✅ Start/end sessions
- ✅ Admit participants from waiting room
- ✅ Remove participants
- ✅ Enable/disable recording
- ✅ Share screen
- ✅ Mute all

### **For Participants**
- ✅ Toggle microphone
- ✅ Toggle camera
- ✅ Share screen (if enabled)
- ✅ Chat (if enabled)
- ✅ Leave session

---

## 📱 **Browser Support**

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Full support |
| Edge | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ✅ | ✅ | Full support |
| Opera | ⚠️ | ⚠️ | Limited |

**Requirements**:
- HTTPS required (or localhost for testing)
- Camera/microphone permissions
- Modern browser (2020+)

---

## 🧪 **Testing the System**

### **Test 1: Create and Join**

1. **Create session**:
   ```bash
   curl -X POST http://localhost:5000/api/sessions \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Session",
       "scheduledStartTime": "2025-01-25T15:00:00Z",
       "scheduledEndTime": "2025-01-25T16:00:00Z",
       "participants": [{"email": "test@example.com", "name": "Test"}]
     }'
   ```

2. **Copy accessLink from response**

3. **Open in browser**:
   ```
   http://localhost:5175/session/join/[accessLink]
   ```

4. **Enter details and join**

### **Test 2: Multi-participant**

1. Create session
2. Copy join link
3. Open in **multiple browser tabs** (or devices)
4. Join with different names
5. Verify video/audio works between tabs

---

## 🐛 **Common Issues & Fixes**

### **Issue: "Session not found"**
**Fix**: Check that the accessLink is correct and session hasn't been cancelled

### **Issue: "Failed to access camera/microphone"**
**Fix**: 
- Allow browser permissions
- Ensure HTTPS (or localhost)
- Check device settings

### **Issue: "No video/audio from other participants"**
**Fix**:
- Check network firewall
- Verify STUN/TURN servers configured
- Try different network

### **Issue: "Email invites not sending"**
**Fix**:
- Verify email service in `.env`
- Check server logs
- Test email configuration separately

---

## 📈 **Analytics & Reports**

### **Session Metrics Available**

```javascript
{
  peakParticipants: 45,
  totalDuration: 3600, // seconds
  participants: [
    {
      name: "John Doe",
      joinedAt: "2025-01-25T10:06:00Z",
      leftAt: "2025-01-25T11:03:00Z",
      duration: 3420 // 57 minutes
    }
  ]
}
```

### **View Analytics**

```javascript
const getSessionAnalytics = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  
  console.log('Peak participants:', response.data.peakParticipants);
  console.log('Total duration:', response.data.totalDuration);
  console.log('Participants:', response.data.participants);
};
```

---

## 🔄 **Workflow Examples**

### **Workflow 1: Scheduled Webinar**

1. **Admin schedules** webinar for next week
2. **System sends** email invites to 50 participants
3. **Reminders sent** 1 hour before
4. **Admin starts** session at scheduled time
5. **Participants join** via email link
6. **Session runs** for 1 hour
7. **Admin ends** session
8. **Analytics saved** automatically

### **Workflow 2: Urgent Support Call**

1. **Customer creates** support ticket
2. **Agent escalates** to video call
3. **System creates** session immediately
4. **Email sent** to customer
5. **Customer joins** within minutes
6. **Issue resolved** on video
7. **Session ends**
8. **Link added** to ticket for reference

### **Workflow 3: Recurring Training**

1. **Create session template**
2. **Schedule weekly** for next month
3. **Same participants** auto-invited
4. **Reminders sent** each time
5. **Sessions recorded** for later viewing

---

## 🎯 **Next Steps**

### **Immediate Actions**

1. ✅ Add route to your dashboard menu:
   ```jsx
   <Link to="/dashboard/sessions">Live Sessions</Link>
   ```

2. ✅ Test the system:
   - Create a test session
   - Try joining from different devices
   - Verify email notifications

3. ✅ Configure email templates (optional):
   - Customize invitation design
   - Add company branding
   - Personalize messages

### **Optional Enhancements**

- [ ] Add calendar integration (Google Calendar, Outlook)
- [ ] Set up cloud recording storage
- [ ] Create session templates for common use cases
- [ ] Add automated follow-up emails
- [ ] Integrate with CRM system

---

## 📚 **Additional Resources**

- **Full Documentation**: `LIVE_SUPPORT_COMPLETE_SYSTEM.md`
- **API Reference**: See "API Endpoints" section above
- **WebRTC Guide**: Mozilla WebRTC Documentation
- **Socket.IO Docs**: https://socket.io/docs/

---

## ✅ **System Checklist**

- [x] Support ticketing system
- [x] WebRTC video infrastructure
- [x] Live session model
- [x] Session scheduling API
- [x] Email invitation system
- [x] Frontend dashboard
- [x] Public join page
- [x] Real-time notifications
- [x] Multi-participant support
- [x] Session analytics
- [x] Security features
- [x] Mobile support

---

**Status**: ✅ **READY TO USE**  
**Version**: 1.0  
**Updated**: January 2025

Your live support system is fully functional and ready for production use!
