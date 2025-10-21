import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Package,
  Clock,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  RefreshCw,
  Store as StoreIcon,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import PaymentOptions from '@/components/payments/PaymentOptions';
import { useCart } from '@/context/CartContext';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cart, update, remove, clear, total, count } = useCart();
  const { socket, connected } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  });

  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
    deliveryMethod: 'standard',
    specialInstructions: ''
  });

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || ''
      });
    }
  }, [isAuthenticated, user]);

  // Socket.IO for real-time order updates
  useEffect(() => {
    if (socket && connected && orderNumber) {
      socket.on('order_status_updated', (data) => {
        if (data.orderNumber === orderNumber) {
          toast.info(`Order ${orderNumber}: ${data.status}`);
        }
      });

      return () => {
        socket.off('order_status_updated');
      };
    }
  }, [socket, connected, orderNumber]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      remove(id);
      toast.success('Item removed from cart');
      return;
    }
    update(id, newQuantity);
  };

  const removeItem = (id) => {
    remove(id);
    toast.success('Item removed from cart');
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    if (subtotal >= 10000) return 0; // Free shipping over KES 10,000
    return shippingInfo.deliveryMethod === 'express' ? 800 : 400;
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.16); // 16% VAT
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost() + getTax();
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingInfoChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return cart.length > 0;
      case 2:
        return customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone;
      case 3:
        return shippingInfo.address && shippingInfo.city && shippingInfo.state && shippingInfo.zipCode;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePaymentSuccess = async (paymentData) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        customer: customerInfo,
        shipping: shippingInfo,
        items: cart.map(item => ({
          product: item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        payment: paymentData,
        subtotal: getSubtotal(),
        shipping: getShippingCost(),
        tax: getTax(),
        total: getTotal(),
        status: 'pending'
      };

      const response = await api.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderNum = response.data.orderNumber || `ORD-${Date.now()}`;
      setOrderNumber(orderNum);
      setOrderComplete(true);
      setCurrentStep(5);
      
      // Emit socket event for real-time order tracking
      if (socket && connected) {
        socket.emit('order_created', {
          orderNumber: orderNum,
          userId: user?._id,
          total: getTotal()
        });
      }

      // Clear cart after successful order
      clear();
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    toast.error('Payment failed. Please try again.');
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Order Confirmed!</h2>
                <p className="text-muted-foreground mt-2">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Order Number</p>
                <p className="text-lg font-bold text-primary">{orderNumber}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={() => navigate('/dashboard/products')} className="w-full">
                  Continue Shopping
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/ecommerce')} className="w-full">
                  View Order History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Cart Review', icon: ShoppingCart },
    { number: 2, title: 'Customer Info', icon: User },
    { number: 3, title: 'Shipping', icon: Truck },
    { number: 4, title: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Cart Review */}
            {currentStep === 1 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Review Your Cart
                  </CardTitle>
                  <CardDescription>
                    Review your items before proceeding to checkout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          KES {item.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {cart.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <Button 
                        onClick={() => navigate('/dashboard/products')} 
                        className="mt-4"
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={customerInfo.company}
                      onChange={(e) => handleCustomerInfoChange('company', e.target.value)}
                      placeholder="Your Company"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Shipping Information */}
            {currentStep === 3 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                  <CardDescription>
                    Where should we deliver your order?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                        placeholder="Nairobi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/County *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                        placeholder="Nairobi County"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                        placeholder="00100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={shippingInfo.country} onValueChange={(value) => handleShippingInfoChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryMethod">Delivery Method</Label>
                    <Select value={shippingInfo.deliveryMethod} onValueChange={(value) => handleShippingInfoChange('deliveryMethod', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Delivery (3-5 days) - KES 400</SelectItem>
                        <SelectItem value="express">Express Delivery (1-2 days) - KES 800</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      value={shippingInfo.specialInstructions}
                      onChange={(e) => handleShippingInfoChange('specialInstructions', e.target.value)}
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentOptions
                    amount={getTotal()}
                    description={`Order for ${cart.length} items`}
                    currency="KES"
                    triggerText={`Pay KES ${getTotal().toLocaleString()}`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Secure Payment</p>
                        <p className="text-xs text-muted-foreground">
                          Your payment information is encrypted and secure. We never store your payment details.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  {currentStep === 3 ? 'Proceed to Payment' : 'Next'}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KES {getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {getShippingCost() === 0 ? 'Free' : `KES ${getShippingCost().toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (16%)</span>
                    <span>KES {getTax().toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>KES {getTotal().toLocaleString()}</span>
                  </div>
                </div>

                {getShippingCost() === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Free shipping on orders over KES 10,000!
                    </p>
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Estimated delivery: 3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
