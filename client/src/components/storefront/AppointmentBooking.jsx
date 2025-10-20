import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

export default function AppointmentBooking({ onSuccess, preSelectedService }) {
  const { inviteCode } = useParams();
  const { socket, connected } = useSocket();
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Service, 2: DateTime, 3: Details, 4: Confirm

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  useEffect(() => {
    setAvailableSlots(generateTimeSlots());
  }, []);

  // Fetch real services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const params = inviteCode ? { inviteCode } : {};
        const { data } = await api.get('/public/services', { params });
        
        // Format services for booking
        const formattedServices = data.map(service => ({
          id: service._id,
          _id: service._id,
          name: service.name,
          description: service.description || '',
          duration: parseInt(service.duration) || 60,
          price: service.price || 0,
          category: service.category || 'General'
        }));
        
        setServices(formattedServices);
        
        // Auto-select pre-selected service
        if (preSelectedService && formattedServices.length > 0) {
          const matchedService = formattedServices.find(s => 
            s.id === preSelectedService.id || s.name === preSelectedService.name
          );
          if (matchedService) {
            handleServiceSelect(matchedService);
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Could not load services. Please try again.');
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [inviteCode, preSelectedService]);

  // Real-time service updates
  useEffect(() => {
    if (!socket || !connected || !inviteCode) return;

    socket.on('service_sync', (data) => {
      if (data.type === 'insert') {
        setServices(prev => [...prev, {
          id: data.service._id,
          _id: data.service._id,
          name: data.service.name,
          description: data.service.description || '',
          duration: parseInt(data.service.duration) || 60,
          price: data.service.price || 0,
          category: data.service.category || 'General'
        }]);
      } else if (data.type === 'update') {
        setServices(prev => prev.map(s => 
          s.id === data.service._id ? {
            id: data.service._id,
            _id: data.service._id,
            name: data.service.name,
            description: data.service.description || '',
            duration: parseInt(data.service.duration) || 60,
            price: data.service.price || 0,
            category: data.service.category || 'General'
          } : s
        ));
      } else if (data.type === 'delete') {
        setServices(prev => prev.filter(s => s.id !== data.service._id));
      }
    });

    return () => {
      socket.off('service_sync');
    };
  }, [socket, connected, inviteCode]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateTimeNext = () => {
    if (!formData.date || !formData.time) {
      toast.error('Please select both date and time');
      return;
    }
    setStep(3);
  };

  const handleDetailsNext = () => {
    if (!formData.customerName || !formData.customerEmail) {
      toast.error('Please fill in your name and email');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setStep(4);
  };

  const handleBookAppointment = async () => {
    setLoading(true);

    try {
      const appointmentData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        service: selectedService.name,
        serviceId: selectedService._id || selectedService.id,
        time: new Date(`${formData.date}T${formData.time}`),
        durationMinutes: selectedService.duration,
        status: 'Pending',
        notes: formData.notes,
        price: selectedService.price,
        inviteCode
      };

      // Submit to backend
      const { data } = await api.post('/public/appointments', appointmentData);

      toast.success('Appointment booked successfully!');
      
      if (onSuccess) {
        onSuccess(data);
      }

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        date: '',
        time: '',
        notes: ''
      });
      setSelectedService(null);
      setStep(1);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Render based on step
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>
          {step === 1 && 'Choose a service to get started'}
          {step === 2 && 'Select your preferred date and time'}
          {step === 3 && 'Enter your contact information'}
          {step === 4 && 'Review and confirm your booking'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s === step
                    ? 'bg-green-500 text-white'
                    : s < step
                    ? 'bg-green-200 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-1 w-12 md:w-24 ${
                    s < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Services</h3>
            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No services available at this time.</p>
                  <p className="text-sm text-muted-foreground mt-2">Please check back later.</p>
                </CardContent>
              </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:border-green-500 transition-colors"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      ${service.price}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Selected Service</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="font-semibold">{selectedService?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedService?.duration} minutes • ${selectedService?.price}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={getMinDate()}
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="time">Select Time</Label>
                <select
                  id="time"
                  className="w-full border rounded px-3 py-2"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                >
                  <option value="">Choose a time slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleDateTimeNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or information..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleDetailsNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Your Booking</h3>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-semibold">{selectedService?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-semibold">
                    {new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {formData.time}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedService?.duration} minutes</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-semibold">{formData.customerName}</p>
                  <p className="text-sm">{formData.customerEmail}</p>
                  {formData.customerPhone && (
                    <p className="text-sm">{formData.customerPhone}</p>
                  )}
                </div>

                {formData.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{formData.notes}</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-lg font-bold text-green-600">
                    Total: ${selectedService?.price}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button 
                onClick={handleBookAppointment} 
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
