import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
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
    toast.success("Booking cancelled successfully");
  };

  const handleReschedule = (id) => {
    toast.info("Reschedule feature coming soon!");
  };

  const upcomingBookings = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");
  const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground">Manage your appointments and view history</p>
      </div>

      {/* Upcoming Bookings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Upcoming Appointments</h2>
        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="card-hover">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl">{booking.service}</CardTitle>
                      <CardDescription className="mt-1">
                        Booking ID: #{booking.id.toString().padStart(4, '0')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time} ({booking.duration})</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>Staff: {booking.staff}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-xl font-bold text-primary">
                      Total: KES {booking.price.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReschedule(booking.id)}
                      >
                        Reschedule
                      </Button>
                      {booking.status !== "completed" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button className="mt-4">Book an Appointment</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Past Appointments</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardHeader>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{booking.location}</span>
                    <span className="font-semibold">KES {booking.price.toLocaleString()}</span>
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