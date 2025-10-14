import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, CheckCircle2, MapPin, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CheckoutFlow = ({ open, onClose, cartItems, cartTotal, onClearCart }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [guestCheckout, setGuestCheckout] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    mpesaPhone: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = () => {
    toast({
      title: "Order Placed Successfully! 🎉",
      description: `Your order #${Math.floor(Math.random() * 10000)} has been confirmed. You'll receive a confirmation email shortly.`,
    });
    onClearCart();
    setStep(4);
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      mpesaPhone: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {["Cart", "Details", "Payment", "Done"].map((label, index) => (
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
              {index < 3 && (
                <div
                  className={`h-1 w-12 mx-2 ${
                    step > index + 1 ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Cart Review */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Review Your Order</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-primary">KES {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">KES {cartTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue to Details
            </Button>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
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
                    Email
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
                    Phone
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
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, Apartment 4B"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Nairobi"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Choose Payment Method</h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/20">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-semibold text-foreground">M-Pesa</p>
                      <p className="text-xs text-muted-foreground">Pay via M-Pesa mobile money</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/20">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Credit/Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === "mpesa" && (
              <div className="space-y-2 bg-secondary/20 p-4 rounded-lg">
                <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesaPhone"
                  name="mpesaPhone"
                  value={formData.mpesaPhone}
                  onChange={handleInputChange}
                  placeholder="+254 700 000000"
                  required
                />
                <p className="text-xs text-muted-foreground">You'll receive an STK push to confirm payment</p>
              </div>
            )}

            <Separator />
            
            <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">KES {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-success">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-foreground">Total</span>
                <span className="text-primary">KES {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmitOrder}>
                Place Order
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="text-center space-y-4 py-8">
            <div className="h-16 w-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Order Confirmed!</h3>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email with tracking details shortly.
            </p>
            <Button className="w-full" onClick={resetAndClose}>
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutFlow;