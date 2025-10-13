import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Mock booking data
const bookings = [
  {
    id: 1,
    service: "Premium Hair Treatment",
    date: "2025-10-15",
    time: "10:00 AM",
    duration: "1 hour",
    status: "confirmed",
    price: 2500,
    location: "Main Branch",
    staff: "Sarah Johnson"
  },
  {
    id: 2,
    service: "Spa Package",
    date: "2025-10-20",
    time: "02:00 PM",
    duration: "2 hours",
    status: "pending",
    price: 5000,
    location: "Downtown Branch",
    staff: "Michael Chen"
  },
  {
    id: 3,
    service: "Manicure & Pedicure",
    date: "2025-09-28",
    time: "11:00 AM",
    duration: "45 min",
    status: "completed",
    price: 1500,
    location: "Main Branch",
    staff: "Emily Davis"
  },
];

const MyBookings = () => {
  // Function to return the correct badge style based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        // Assuming 'bg-success' is a custom or configured class for confirmation color
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "completed":
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleCancel = (id) => {
    // In a real app, this would call an API to update the status in the database
    toast.success(`Booking #${String(id).padStart(4, '0')} cancelled successfully`);
  };

  const handleReschedule = (id) => {
    // In a real app, this would open a modal or navigate to a reschedule form
    toast.info(`Reschedule feature for booking #${String(id).padStart(4, '0')} coming soon!`);
  };

  const upcomingBookings = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-extrabold text-foreground">My Appointments</h1>
        <p className="text-lg text-muted-foreground mt-1">Easily manage your future and past beauty and spa sessions.</p>
      </div>

      <Separator />

      {/* Upcoming Bookings Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground border-l-4 border-primary pl-3">Upcoming Appointments ({upcomingBookings.length})</h2>
        
        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl text-primary">{booking.service}</CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Booking ID: <span className="font-mono text-xs text-gray-500">#{String(booking.id).padStart(4, '0')}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div className="font-medium text-gray-700">
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    {/* Time & Duration */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <div className="font-medium text-gray-700">
                        {booking.time} <span className="text-xs text-muted-foreground">({booking.duration})</span>
                      </div>
                    </div>
                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div className="font-medium text-gray-700">{booking.location}</div>
                    </div>
                    {/* Staff */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-500" />
                      <div className="font-medium text-gray-700">Staff: {booking.staff}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-2xl font-extrabold text-primary">
                      Total: KES {booking.price.toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleReschedule(booking.id)}
                        className="transition-all hover:bg-yellow-50 hover:border-yellow-300"
                      >
                        Reschedule
                      </Button>
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancel(booking.id)}
                          className="transition-all hover:scale-[1.02]"
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">You have no upcoming appointments.</p>
              <Button
                className="mt-6 shadow-lg hover:shadow-xl"
                onClick={() => {
                  // Navigate to booking page or open booking modal
                  window.location.href = '/dashboard/services';
                  toast.success('Redirecting to services page...');
                }}
              >
                Book a New Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Bookings Section */}
      {pastBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground border-l-4 border-gray-400 pl-3">Past Appointments ({pastBookings.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-80 transition-opacity duration-300 hover:opacity-100">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">{booking.service}</CardTitle>
                      <CardDescription>
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {booking.location}
                    </span>
                    <span className="font-bold text-lg text-gray-700">KES {booking.price.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
