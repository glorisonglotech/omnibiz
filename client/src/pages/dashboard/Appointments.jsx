import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Calendar,
  Clock,
  User,
  Phone,
  Plus,
  Filter,
  Send,
  Trash2,
} from "lucide-react";
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

  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);

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
        const { data } = await api.get(`/appointments?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAppointments(data); // triggers the recalc effect
      } catch (error) {
        toast.error("Error fetching appointments.");
        console.error("Error fetching appointments:", error);
      }
    };

    if (selectedDate) fetchAppointments();
  }, [selectedDate, isAuthenticated]);

  const recalcStats = (list) => {
    const norm = (s = "") => s.trim().toLowerCase();
    const confirmed = list.filter((a) => norm(a.status) === "confirmed").length;
    const pending = list.filter((a) => norm(a.status) === "pending").length;
    const cancelled = list.filter((a) => norm(a.status) === "cancelled").length;

    setTotalAppointments(list.length);
    setConfirmedCount(confirmed);
    setPendingCount(pending);
    setCancelledCount(cancelled);
    // If you track no-shows separately, adjust this; otherwise keep cancelled:
    setNoShows(cancelled);
  };

  useEffect(() => {
    recalcStats(appointments);
  }, [appointments]);

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

    const isValidDate = !isNaN(new Date(newAppointment.time).getTime());
    const duration = Number(newAppointment.durationMinutes);

    if (!isValidDate || isNaN(duration) || duration <= 0) {
      toast.error("Invalid time or duration.");
      return;
    }

    try {
      const payload = {
        customerName: newAppointment.customerName,
        service: newAppointment.service,
        time: new Date(newAppointment.time),
        durationMinutes: duration,
        status: newAppointment.status || "Pending",
        notes: newAppointment.notes,
      };

      const token = localStorage.getItem("token");
      const response = await api.post("/appointments", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
      const errorMessage =
        error.response?.data?.error || "Error adding appointment.";
      toast.error(errorMessage);
      console.error("Error adding appointment:", errorMessage);
    }
  };
  // Open edit dialog with a copy
  const handleEditClick = (appointment) => {
    setEditAppointment({
      ...appointment,
      time: formatForDatetimeLocal(appointment.time),
      durationMinutes: String(appointment.durationMinutes ?? ""),
    });
    setIsEditAppointmentOpen(true);
  };
   
  // Format Date -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
const formatForDatetimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return ""; // guard bad dates
  const pad = (n) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};


  // Controlled edit form changes
  const handleEditAppointmentChange = (field, value) => {
    setEditAppointment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update appointment via API and refresh list locally
  const handleUpdateAppointment = async () => {
    try {
      if (!editAppointment?._id) return;

      const token = localStorage.getItem("token");

      // Prepare payload (convert string fields to expected types)
      const payload = {
        ...editAppointment,
        time: new Date(editAppointment.time),
        durationMinutes: Number(editAppointment.durationMinutes),
      };

      const { data } = await api.put(
        `/appointments/${editAppointment._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAppointments((prev) =>
        prev.map((apt) => (apt._id === data._id ? data : apt))
      );

      setIsEditAppointmentOpen(false);
      setEditAppointment(null);
      toast.success("Appointment updated successfully!");
    } catch (error) {
      toast.error("Error updating appointment.");
      console.error("Error updating appointment:", error);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((apt) => apt._id !== id));
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      toast.error("Error deleting appointment.");
      console.error("Error deleting appointment:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally, show loading state until authentication is verified
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage your appointments.</div>;
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const isSlotBooked = (time) => {
    return appointments.some((apt) => {
      const aptTime = new Date(apt.time);
      const slotTime = `${aptTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${aptTime.getMinutes().toString().padStart(2, "0")}`;
      return slotTime === time;
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Confirmed: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      Pending: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800",
      },
      Cancelled: {
        variant: "destructive",
        className: "bg-red-100 text-red-800",
      },
    };
    return (
      <Badge variant={statusConfig[status]?.variant || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Appointment Scheduling
          </h1>
          <p className="text-muted-foreground">Manage bookings and calendar</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog
            open={isAddAppointmentOpen}
            onOpenChange={setIsAddAppointmentOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-green-500 cursor-pointer hover:bg-green-400">
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
                    onChange={(e) =>
                      handleNewAppointmentChange("customerName", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Service</Label>
                  <Input
                    id="service"
                    placeholder="e.g. Hair Cut"
                    value={newAppointment.service}
                    onChange={(e) =>
                      handleNewAppointmentChange("service", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Date & Time</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={newAppointment.time}
                    onChange={(e) =>
                      handleNewAppointmentChange("time", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleNewAppointmentChange(
                        "durationMinutes",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="border rounded px-2 py-1"
                    value={newAppointment.status}
                    onChange={(e) =>
                      handleNewAppointmentChange("status", e.target.value)
                    }
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Appointment notes"
                    value={newAppointment.notes}
                    onChange={(e) =>
                      handleNewAppointmentChange("notes", e.target.value)
                    }
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="text-red-500"
                  onClick={() => setIsAddAppointmentOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-400"
                  onClick={handleAddAppointment}
                >
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
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-green-600">appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-green-600">status: confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Shows</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{noShows}</div>
            <p className="text-xs text-muted-foreground">Cancelled appointments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule - January 15, 2024</CardTitle>
            <CardDescription>
              View and manage daily appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id || appointment.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="text-center min-w-[80px]">
                    <p className="font-semibold text-foreground">
                      {appointment.time
                        ? new Date(appointment.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.durationMinutes || ""}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">
                        {appointment.customerName}
                      </p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(appointment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                  onClick={() =>
                    handleNewAppointmentChange(
                      "time",
                      `${selectedDate}T${slot}`
                    )
                  }
                >
                  {slot}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isEditAppointmentOpen && editAppointment && (
        <Dialog
          open={isEditAppointmentOpen}
          onOpenChange={setIsEditAppointmentOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>Update appointment details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customerName">Customer Name</Label>
                <Input
                  id="edit-customerName"
                  placeholder="Enter customer name"
                  value={editAppointment.customerName || ""}
                  onChange={(e) =>
                    handleEditAppointmentChange("customerName", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-service">Service</Label>
                <Input
                  id="edit-service"
                  placeholder="e.g. Hair Cut"
                  value={editAppointment.service || ""}
                  onChange={(e) =>
                    handleEditAppointmentChange("service", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-time">Date & Time</Label>
                <Input
                  id="edit-time"
                  type="datetime-local"
                  value={editAppointment.time || ""}
                  onChange={(e) =>
                    handleEditAppointmentChange("time", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-durationMinutes">Duration (minutes)</Label>
                <Input
                  id="edit-durationMinutes"
                  type="number"
                  min="15"
                  step="15"
                  placeholder="e.g. 30"
                  value={editAppointment.durationMinutes || ""}
                  onChange={(e) =>
                    handleEditAppointmentChange(
                      "durationMinutes",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="border rounded px-2 py-1"
                  value={editAppointment.status || "Pending"}
                  onChange={(e) =>
                    handleEditAppointmentChange("status", e.target.value)
                  }
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Appointment notes"
                  className="resize-none"
                  value={editAppointment.notes || ""}
                  onChange={(e) =>
                    handleEditAppointmentChange("notes", e.target.value)
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="text-red-500"
                onClick={() => setIsEditAppointmentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-400"
                onClick={handleUpdateAppointment}
              >
                <Send className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
