import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Plus, Filter } from "lucide-react";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  const appointments = [
    {
      id: 1,
      time: "09:00 AM",
      duration: "1h 30m",
      client: "Emma Wilson",
      phone: "+1 (555) 123-4567",
      service: "Hair Cut & Color",
      status: "confirmed",
      stylist: "Sarah Johnson"
    },
    {
      id: 2,
      time: "10:30 AM",
      duration: "45m",
      client: "Michael Brown",
      phone: "+1 (555) 987-6543",
      service: "Beard Trim",
      status: "confirmed",
      stylist: "David Smith"
    },
    {
      id: 3,
      time: "12:00 PM",
      duration: "2h",
      client: "Lisa Davis",
      phone: "+1 (555) 456-7890",
      service: "Hair Treatment",
      status: "pending",
      stylist: "Sarah Johnson"
    },
    {
      id: 4,
      time: "02:00 PM",
      duration: "1h",
      client: "James Wilson",
      phone: "+1 (555) 321-0987",
      service: "Hair Styling",
      status: "confirmed",
      stylist: "Emma Thompson"
    },
    {
      id: 5,
      time: "03:30 PM",
      duration: "45m",
      client: "Maria Garcia",
      phone: "+1 (555) 654-3210",
      service: "Manicure",
      status: "cancelled",
      stylist: "Lisa Rodriguez"
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      "confirmed": { variant: "default", className: "bg-green-100 text-green-800" },
      "pending": { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      "cancelled": { variant: "destructive", className: "bg-red-100 text-red-800" },
      "completed": { variant: "outline", className: "bg-gray-100 text-gray-800" }
    };
    
    return <Badge variant={statusConfig[status]?.variant || "default"}>{status}</Badge>;
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const isSlotBooked = (time) => {
    return appointments.some(apt => apt.time.includes(time));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage bookings and calendar</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-green-600">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,245</div>
            <p className="text-xs text-green-600">+15% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule - January 15, 2024</CardTitle>
            <CardDescription>View and manage daily appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="text-center min-w-[80px]">
                    <p className="font-semibold text-foreground">{appointment.time}</p>
                    <p className="text-xs text-muted-foreground">{appointment.duration}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{appointment.client}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <p className="text-xs text-muted-foreground">with {appointment.stylist}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Available Slots</CardTitle>
            <CardDescription>Quick booking slots for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={isSlotBooked(slot) ? "secondary" : "outline"}
                  size="sm"
                  disabled={isSlotBooked(slot)}
                  className="text-xs"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed</span>
                <Badge variant="default">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cancelled</span>
                <Badge variant="destructive">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Hair Cut & Style</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hair Coloring</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Beard Trim</span>
                <span className="text-sm font-medium">25%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sarah Johnson</span>
                <Badge variant="default">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">David Smith</span>
                <Badge variant="secondary">Busy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emma Thompson</span>
                <Badge variant="default">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
