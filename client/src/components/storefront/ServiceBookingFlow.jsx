import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, Calendar as CalendarIcon, Clock, User, Mail, Phone, AlertCircle, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import api from "@/lib/api";

const ServiceBookingFlow = ({ open, onClose, service }) => {
  const { toast } = useToast();
  const { inviteCode } = useParams();
  const [step, setStep] = useState(1);
  const [bookingNumber, setBookingNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  // Available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createBooking = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        throw new Error('Please select a date and time');
      }

      // Combine date and time
      const [time, period] = selectedTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      // Parse duration from string like "45 min" or "1 hour"
      const parseDuration = (durationStr) => {
        if (!durationStr) return 60;
        const numMatch = durationStr.match(/\d+/);
        if (!numMatch) return 60;
        const num = parseInt(numMatch[0]);
        if (durationStr.toLowerCase().includes('hour')) return num * 60;
        return num;
      };

      const bookingData = {
        inviteCode: inviteCode || window.location.pathname.split('/').filter(Boolean).pop(),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        service: service.name,
        serviceId: service._id || service.id, // Link to Service model
        time: bookingDateTime.toISOString(),
        durationMinutes: parseDuration(service.duration),
        notes: formData.notes,
        price: service.price
      };

      const customerToken = localStorage.getItem('customerToken');
      const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      
      const response = await api.post('/public/appointments', bookingData, { headers });
      
      const bookingNum = `BOOK-${Date.now()}`;
      setBookingNumber(bookingNum);
      
      return { success: true, bookingNum, data: response.data };
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Booking data sent:', bookingData);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create booking'
      };
    }
  };

  const handleBookingSubmit = async () => {
    // Validate all fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Select Date",
        description: "Please select a date for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Select Time",
        description: "Please select a time slot for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const result = await createBooking();
    setProcessing(false);

    if (result.success) {
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment for ${service.name} has been booked successfully.`,
      });
      setStep(3);
    } else {
      toast({
        title: "Booking Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      notes: ""
    });
    setBookingNumber("");
    setProcessing(false);
    onClose();
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {["Details", "Schedule", "Confirmed"].map((label, index) => (
            <div key={label} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step > index + 1
                    ? "bg-success text-success-foreground"
                    : step === index + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > index + 1 ? "✓" : index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`h-1 w-12 mx-2 ${
                    step > index + 1 ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Service Details & Customer Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Service Details</h3>
            
            {/* Service Summary */}
            <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
              {service.image && (
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-semibold text-lg">{service.name}</h4>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {service.duration}
                </span>
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  KES {service.price?.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            <h3 className="font-semibold text-foreground">Your Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254 700 000000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requests or preferences..."
                  rows={3}
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => {
                if (!formData.name || !formData.email || !formData.phone) {
                  toast({
                    title: "Missing Information",
                    description: "Please fill in all required fields.",
                    variant: "destructive",
                  });
                  return;
                }
                setStep(2);
              }}
            >
              Continue to Schedule
            </Button>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Choose Date & Time</h3>
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Select Date
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date().setHours(0, 0, 0, 0)}
                className="rounded-md border"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time Slot
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Appointment Summary:</strong><br />
                  {service.name}<br />
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br />
                  Time: {selectedTime}<br />
                  Duration: {service.duration}<br />
                  Price: KES {service.price?.toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                className="flex-1"
                onClick={handleBookingSubmit}
                disabled={processing || !selectedDate || !selectedTime}
              >
                {processing ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-4 py-8">
            <div className="h-16 w-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Booking Confirmed!</h3>
            <p className="text-muted-foreground">
              Your appointment for <strong>{service.name}</strong> has been successfully booked.
            </p>
            {selectedDate && selectedTime && (
              <div className="bg-secondary/20 p-4 rounded-lg inline-block">
                <p className="text-sm">
                  <strong>Date:</strong> {selectedDate.toLocaleDateString()}<br />
                  <strong>Time:</strong> {selectedTime}<br />
                  <strong>Duration:</strong> {service.duration}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {formData.email}
            </p>
            <Button className="w-full" onClick={resetAndClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingFlow;
