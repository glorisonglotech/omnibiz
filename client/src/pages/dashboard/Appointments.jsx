import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, User, Phone, Plus, Filter, Send } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const statusOptions = ["Confirmed", "Pending", "Cancelled"];

const Appointments = () => {
    const { user, isAuthenticated, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [noShows, setNoShows] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: "",
    service: "",
    time: "",
    durationMinutes: "",
    status: "Pending",
    notes: "",
  });

  // Fetch appointments and stats from the API
   useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view appointments.");
        return;
      }

      try {
        const response = await api.get(`/appointments?date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token to backend for authorization
          },
        });

        setAppointments(response.data);
        setTotalAppointments(response.data.length);
        setConfirmedCount(response.data.filter((apt) => apt.status === "Confirmed").length);
        setPendingCount(response.data.filter((apt) => apt.status === "Pending").length);
        setCancelledCount(response.data.filter((apt) => apt.status === "Cancelled").length);
        setNoShows(response.data.filter((apt) => apt.status === "Cancelled").length);
        setTotalRevenue(
          response.data
            .filter((apt) => apt.status === "Confirmed")
            .reduce((sum, apt) => sum + (Number(apt.total) || 0), 0)
        );
      } catch (error) {
        toast.error("Error fetching appointments.");
        console.error("Error fetching appointments:", error);
      }
    };

    if (selectedDate) {
      fetchAppointments(); // Fetch appointments when the selected date changes
    }
  }, [selectedDate, isAuthenticated]); // Re-run when selectedDate or authentication state changes

  const handleNewAppointmentChange = (field, value) => {
    setNewAppointment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add a new appointment
  const handleAddAppointment = async () => {
    if (
      !newAppointment.customerName ||
      !newAppointment.service ||
      !newAppointment.time ||
      !newAppointment.durationMinutes
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        ...newAppointment,
        time: new Date(newAppointment.time),
        durationMinutes: Number(newAppointment.durationMinutes),
      };

      // Add the JWT token to the Authorization header for posting
      const response = await api.post("/appointments", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT token to backend for authorization
        },
      });

      setAppointments((prev) => [response.data, ...prev]);
      setIsAddAppointmentOpen(false);
      setNewAppointment({
        customerName: "",
        service: "",
        time: "",
        durationMinutes: "",
        status: "Pending",
        notes: "",
      });
      toast.success("Appointment added successfully!");
    } catch (error) {
      toast.error("Error adding appointment.");
      console.error("Error adding appointment:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally, show loading state until authentication is verified
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage your appointments.</div>;
  }


  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const isSlotBooked = (time) => {
    return appointments.some(apt => {
      const aptTime = new Date(apt.time);
      const slotTime = `${aptTime.getHours().toString().padStart(2, "0")}:${aptTime.getMinutes().toString().padStart(2, "0")}`;
      return slotTime === time;
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Confirmed": { variant: "default", className: "bg-green-100 text-green-800" },
      "Pending": { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      "Cancelled": { variant: "destructive", className: "bg-red-100 text-red-800" }
    };
    return <Badge variant={statusConfig[status]?.variant || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
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
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className='bg-green-500 cursor-pointer hover:bg-green-400'>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new appointment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={newAppointment.customerName}
                    onChange={(e) => handleNewAppointmentChange("customerName", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Service</Label>
                  <Input
                    id="service"
                    placeholder="e.g. Hair Cut"
                    value={newAppointment.service}
                    onChange={(e) => handleNewAppointmentChange("service", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Date & Time</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={newAppointment.time}
                    onChange={(e) => handleNewAppointmentChange("time", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    min="15"
                    step="15"
                    placeholder="e.g. 30"
                    value={newAppointment.durationMinutes}
                    onChange={(e) => handleNewAppointmentChange("durationMinutes", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="border rounded px-2 py-1"
                    value={newAppointment.status}
                    onChange={(e) => handleNewAppointmentChange("status", e.target.value)}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Appointment notes"
                    value={newAppointment.notes}
                    onChange={(e) => handleNewAppointmentChange("notes", e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="text-red-500" onClick={() => setIsAddAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-500 hover:bg-green-400" onClick={handleAddAppointment}>
                  <Send className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-green-600">From database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-green-600">From database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{noShows}</div>
            <p className="text-xs text-muted-foreground">From database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600">From database</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule - January 15, 2024</CardTitle>
            <CardDescription>View and manage daily appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="text-center min-w-[80px]">
                    <p className="font-semibold text-foreground">
                      {appointment.time
                        ? new Date(appointment.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.durationMinutes || ""}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{appointment.customerName}</p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
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
                  onClick={() => handleNewAppointmentChange("time", `${selectedDate}T${slot}`)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmed</span>
                <Badge variant="default">{confirmedCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">{pendingCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cancelled</span>
                <Badge variant="destructive">{cancelledCount}</Badge>
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