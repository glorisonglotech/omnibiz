import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertCircle, MapPin, User, CheckCircle2, XCircle, LogIn } from "lucide-react";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useParams, useNavigate } from "react-router-dom";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRelogin, setNeedsRelogin] = useState(false);

  const { socket } = useSocket();
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const customerToken = localStorage.getItem('customerToken');
    if (customerToken) {
      fetchBookings();
    } else {
      setLoading(false);
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const customerToken = localStorage.getItem('customerToken');
    if (!customerToken) return;
    
    const handler = () => {
      const token = localStorage.getItem('customerToken');
      if (token) fetchBookings();
    };
    socket.on('appointment_updated', handler);
    return () => {
      socket.off('appointment_updated', handler);
    };
  }, [socket]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    setNeedsRelogin(false);
    try {
      const customerToken = localStorage.getItem('customerToken');
      if (!customerToken) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Note: This endpoint would need to be created on the backend
      // For now, we'll use a mock endpoint or handle gracefully
      try {
        const response = await api.get('/customer/appointments', {
          headers: {
            Authorization: `Bearer ${customerToken}`
          }
        });
        
        const data = response.data;
        const list = Array.isArray(data) ? data : (data.appointments || []);
        setBookings(list);
        console.log(`✅ Loaded ${list.length} bookings for current customer`);
      } catch (apiError) {
        // If endpoint doesn't exist yet, show empty state
        if (apiError.response?.status === 404) {
          setBookings([]);
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in to view your bookings');
        setNeedsRelogin(true);
      } else if (err.response?.status === 400 && err.response?.data?.requiresRelogin) {
        setError('Your session has expired. Please log in again to view your bookings.');
        setNeedsRelogin(true);
        localStorage.removeItem('customerToken');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Unable to load bookings';
        setError(errorMessage);
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('login')) {
          setNeedsRelogin(true);
        }
      } else {
        setError('Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Booking History</h2>
        <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      ) : error ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{error}</h3>
            <div className="flex gap-2 justify-center">
              {needsRelogin ? (
                <Button 
                  onClick={() => {
                    if (inviteCode) {
                      navigate(`/client/login/${inviteCode}`);
                    } else {
                      navigate('/client/login');
                    }
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In Again
                </Button>
              ) : (
                <Button onClick={fetchBookings}>Try Again</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Your service bookings will appear here</p>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking._id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {booking.service || 'Service Booking'}
                </CardTitle>
                <Badge variant={getStatusColor(booking.status)} className="gap-1">
                  {getStatusIcon(booking.status)}
                  {booking.status || 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(booking.time || booking.createdAt).toLocaleDateString()}</span>
                <span>{new Date(booking.time || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {booking.customerName && (
                  <div className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{booking.customerName}</span>
                  </div>
                )}
                {booking.durationMinutes && (
                  <div className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{booking.durationMinutes} minutes</span>
                  </div>
                )}
                {booking.notes && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}
              </div>
              
              {booking.price && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Price:</span>
                  <span className="text-lg font-bold text-green-600">
                    KES {booking.price?.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default BookingHistory;
