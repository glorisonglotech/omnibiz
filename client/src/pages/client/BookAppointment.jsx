import { useState } from "react";
import { Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import api from "@/lib/api";

const services = [
  { id: 1, name: "Premium Hair Treatment", duration: "1 hour", price: 2500 },
  { id: 2, name: "Manicure & Pedicure", duration: "45 min", price: 1500 },
  { id: 3, name: "Face Massage", duration: "30 min", price: 2000 },
  { id: 4, name: "Spa Package", duration: "2 hours", price: 5000 },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const BookAppointment = () => {
  const [date, setDate] = useState();
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService || !date || !selectedTime) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      // Build payload aligning to server model
      const payload = {
        customerName: formData.name,
        service: services.find(s => s.id.toString() === selectedService)?.name || selectedService,
        time: new Date(`${date?.toISOString().split('T')[0]}T${selectedTime.replace(' ', '')}`),
        durationMinutes: parseInt((services.find(s => s.id.toString() === selectedService)?.duration || '0').replace(/[^0-9]/g, ''), 10) || 60,
        notes: formData.notes,
        email: formData.email
      };

      const token = localStorage.getItem('token');
      const inviteCode = window.location.pathname.split('/').pop();
      if (token) {
        await api.post('/appointments', payload);
      } else {
        await api.post('/public/appointments', { ...payload, inviteCode });
      }

      toast.success("Appointment booked successfully! We'll send you a confirmation shortly.", {
        icon: <CheckCircle className="h-5 w-5" />,
      });

      // Reset form
      setStep(1);
      setDate(undefined);
      setSelectedService("");
      setSelectedTime("");
      setFormData({ name: "", phone: "", email: "", notes: "" });
    } catch (err) {
      console.error('Failed to book appointment', err);
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book an Appointment</h1>
        <p className="text-muted-foreground">Schedule your service in 3 easy steps</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 mx-2 ${
                step > s ? "bg-primary" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Choose Service */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Choose Your Service
              </CardTitle>
              <CardDescription>Select the service you'd like to book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedService === service.id.toString()
                        ? "border-primary ring-2 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedService(service.id.toString())}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration}
                        </span>
                        <span className="font-bold text-primary">
                          KES {service.price.toLocaleString()}
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedService}
                className="w-full"
              >
                Continue to Date & Time
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose your preferred appointment slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <Label>Select Date</Label>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mt-2"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>Select Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {time}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedServiceData && date && selectedTime && (
                    <Card className="bg-accent">
                      <CardHeader>
                        <CardTitle className="text-base">Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p><strong>Service:</strong> {selectedServiceData.name}</p>
                        <p><strong>Date:</strong> {date.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {selectedTime}</p>
                        <p><strong>Duration:</strong> {selectedServiceData.duration}</p>
                        <p className="text-lg font-bold text-primary mt-2">
                          Total: KES {selectedServiceData.price.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!date || !selectedTime}
                className="flex-1"
              >
                Continue to Contact Info
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Contact Information
              </CardTitle>
              <CardDescription>We'll use this to confirm your appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="0712345678"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
};

export default BookAppointment;