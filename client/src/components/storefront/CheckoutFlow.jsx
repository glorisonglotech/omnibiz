import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MapPin, User, Mail, Phone, AlertCircle, Wallet, CreditCard, Smartphone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentOptions from "@/components/payments/PaymentOptions";
import api from "@/lib/api";
import { useParams } from "react-router-dom";

const CheckoutFlow = ({ open, onClose, cartItems, cartTotal, onClearCart }) => {
  const { toast } = useToast();
  const { inviteCode } = useParams();
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash, paynow
  const [selectedDigitalPayment, setSelectedDigitalPayment] = useState("mpesa"); // mpesa, paypal
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrderInDatabase = async (paymentData = null) => {
    try {
      const orderNum = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Prepare order data
      const orderData = {
        orderId: orderNum,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        items: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          currency: item.currency || 'USD',
          image: item.image || null // Include product image for order display
        })),
        subtotal: cartTotal,
        total: cartTotal,
        status: paymentMethod === 'cash' || paymentMethod === 'dollar' ? 'Submitted' : 'Processing',
        paymentStatus: paymentData ? 'Paid' : 'Pending',
        deliveryInfo: {
          address: formData.address,
          city: formData.city,
          method: 'delivery',
          contactPerson: formData.name,
          contactPhone: formData.phone
        },
        paymentMethod: paymentMethod,
        paymentDetails: paymentData || { method: paymentMethod },
        orderType: 'standard',
        priority: 'medium'
      };

      // Submit order to backend
      // Get customer token (for authenticated customers) or use public endpoint
      const customerToken = localStorage.getItem('customerToken');
      
      // Extract inviteCode from URL params or pathname
      const codeFromUrl = inviteCode || window.location.pathname.split('/').filter(Boolean).pop();
      
      if (!codeFromUrl) {
        throw new Error('Store invite code is missing. Please refresh the page and try again.');
      }
      
      let response;
      
      // Always use public endpoint for storefront orders (with optional customer token for linking)
      const headers = customerToken ? { Authorization: `Bearer ${customerToken}` } : {};
      response = await api.post('/public/orders', 
        { ...orderData, inviteCode: codeFromUrl }, 
        { headers }
      );
      
      console.log('✅ Order created successfully:', response.data);
      return { success: true, orderNum, order: response.data };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to create order. Please try again.' 
      };
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setProcessingPayment(true);
    const result = await createOrderInDatabase(paymentData);
    setProcessingPayment(false);
    
    if (result.success) {
      setOrderNumber(result.orderNum);
      toast({
        title: "Payment & Order Successful!",
        description: `Your order #${result.orderNum} has been confirmed and saved.`,
      });
      onClearCart();
      setStep(4);
    } else {
      toast({
        title: "Order Creation Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error) => {
    setProcessingPayment(false);
    toast({
      title: "Payment Failed",
      description: error?.message || "Payment could not be processed. Please try again.",
      variant: "destructive",
    });
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    });
    setOrderNumber("");
    setProcessingPayment(false);
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
                {step > index + 1 ? "" : index + 1}
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
              <Button 
                className="flex-1" 
                onClick={() => {
                  // Validate required fields
                  if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
                    toast({
                      title: "Missing Information",
                      description: "Please fill in all required fields before continuing.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setStep(3);
                }}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Complete Payment</h3>
            
            {/* Order Summary */}
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

            {/* Customer Info Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Delivery Details
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{formData.name}</p>
                <p>{formData.email}</p>
                <p>{formData.phone}</p>
                <p>{formData.address}, {formData.city}</p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-semibold">Secure Payment</p>
                <p className="text-xs">Click below to choose your payment method. You can pay via M-Pesa or credit/debit card.</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold">Choose Payment Method</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "cash" ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-green-300"}`}
                >
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay when you receive</div>
                </button>

                <button
                  onClick={() => setPaymentMethod("paynow")}
                  className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === "paynow" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:border-blue-300"}`}
                >
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold">Pay Now</div>
                  <div className="text-xs text-muted-foreground">M-Pesa or PayPal</div>
                </button>
              </div>
            </div>

            {/* Digital Payment Options - Show when Pay Now is selected */}
            {paymentMethod === "paynow" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-semibold text-sm">Select Payment Gateway</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedDigitalPayment("mpesa")}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedDigitalPayment === "mpesa" ? "border-green-600 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-green-300"}`}
                  >
                    <Smartphone className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="font-semibold text-sm">M-Pesa</div>
                    <div className="text-xs text-muted-foreground">Safaricom STK Push</div>
                  </button>

                  <button
                    onClick={() => setSelectedDigitalPayment("paypal")}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedDigitalPayment === "paypal" ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:border-blue-300"}`}
                  >
                    <Globe className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <div className="font-semibold text-sm">PayPal</div>
                    <div className="text-xs text-muted-foreground">Cards & PayPal</div>
                  </button>
                </div>
              </div>
            )}

            {/* Digital Payment Options */}
            {paymentMethod === "paynow" ? (
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <PaymentOptions
                  amount={cartTotal}
                  description={`Order for ${cartItems.length} items from store`}
                  currency="KES"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  triggerText="Proceed to Payment"
                  showMpesa={selectedDigitalPayment === "mpesa"}
                  showPaypal={selectedDigitalPayment === "paypal"}
                  disabled={processingPayment || !formData.name || !formData.email || !formData.phone}
                />
              </div>
            ) : paymentMethod === "cash" && (
              <Button 
                className="w-full h-12 text-lg font-bold"
                onClick={async () => {
                  // Validate all required fields
                  if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
                    toast({
                      title: "Missing Information",
                      description: "Please go back and fill in all delivery details.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  setProcessingPayment(true);
                  const result = await createOrderInDatabase();
                  setProcessingPayment(false);
                  
                  if (result.success) {
                    setOrderNumber(result.orderNum);
                    toast({
                      title: "Order Placed!",
                      description: `Your order #${result.orderNum} has been confirmed. Payment method: Cash on Delivery.`,
                    });
                    onClearCart();
                    setStep(4);
                  } else {
                    toast({
                      title: "Order Failed",
                      description: result.error,
                      variant: "destructive",
                    });
                  }
                }}
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Place Order (Cash on Delivery)"}
              </Button>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setStep(2)}
                disabled={processingPayment}
              >
                Back
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