import React, { useState, useEffect } from 'react';
import { Check, X, Star, Zap, Crown, CreditCard, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Real-time subscription status
  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
      // Set up real-time subscription updates
      const interval = setInterval(fetchCurrentSubscription, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current');
      setCurrentSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      originalPrice: 0,
      period: "forever",
      description: "Perfect for small businesses just getting started",
      icon: Star,
      popular: false,
      features: [
        "Up to 100 products",
        "Basic inventory tracking",
        "5 team members",
        "Email support",
        "Basic reports",
        "Mobile app access"
      ],
      limitations: [
        "Limited integrations",
        "Basic analytics only",
        "No custom branding"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
      trialDays: 0
    },
    {
      id: "professional",
      name: "Professional",
      price: isAnnual ? 24 : 29,
      originalPrice: 29,
      period: isAnnual ? "per month (billed annually)" : "per month",
      description: "Ideal for growing businesses with advanced needs",
      icon: Zap,
      popular: true,
      features: [
        "Unlimited products",
        "Advanced inventory management",
        "Unlimited team members",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Multi-location support",
        "Automated workflows",
        "Custom reports",
        "Real-time AI insights",
        "Interactive maps"
      ],
      limitations: [],
      buttonText: currentSubscription?.plan === 'professional' ? "Current Plan" : "Start Free Trial",
      buttonVariant: currentSubscription?.plan === 'professional' ? "outline" : "default",
      trialDays: 14
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      originalPrice: "Custom",
      period: "contact us",
      description: "For large organizations with complex requirements",
      icon: Crown,
      popular: false,
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom development",
        "On-premise deployment",
        "Advanced security features",
        "SLA guarantee",
        "Training & onboarding",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
        "Advanced compliance",
        "Custom reporting"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      trialDays: 30
    }
  ];

  // Handle plan selection and payment
  const handlePlanSelect = async (plan) => {
    if (!user) {
      toast.info('Please sign in to subscribe to a plan');
      navigate('/login');
      return;
    }

    if (plan.id === 'starter') {
      // Free plan - direct activation
      try {
        setPaymentLoading(true);
        await api.post('/subscriptions/activate', { planId: plan.id });
        toast.success('Welcome to ominbiz Starter!');
        fetchCurrentSubscription();
      } catch (error) {
        toast.error('Failed to activate plan. Please try again.');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    if (plan.id === 'enterprise') {
      // Enterprise - contact sales
      navigate('/contact');
      return;
    }

    // Professional plan - show payment modal
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentLoading(true);

      // Validate payment form
      if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
        toast.error('Please fill in all payment details');
        return;
      }

      // Simulate payment processing
      const paymentData = {
        planId: selectedPlan.id,
        isAnnual,
        amount: isAnnual ? selectedPlan.price * 12 * 0.8 : selectedPlan.price, // 20% discount for annual
        paymentMethod: {
          cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
          expiryDate: paymentForm.expiryDate,
          cvv: paymentForm.cvv,
          cardholderName: paymentForm.cardholderName,
          billingAddress: paymentForm.billingAddress
        }
      };

      const response = await api.post('/subscriptions/subscribe', paymentData);

      if (response.data.success) {
        toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
        setShowPaymentModal(false);
        fetchCurrentSubscription();

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Simple, Transparent <span className="text-green-500">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. Start free and scale as you grow.
          </p>
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </span>
          </div>

          {/* Current Subscription Status */}
          {currentSubscription && (
            <div className="max-w-md mx-auto mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">
                      Current Plan: {currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)}
                    </span>
                  </div>
                  <div className="text-center text-sm text-green-600 mt-2">
                    {currentSubscription.status === 'active' ? (
                      <>Next billing: {new Date(currentSubscription.nextBilling).toLocaleDateString()}</>
                    ) : (
                      <>Status: {currentSubscription.status}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative ${plan.popular ? 'border-green-500 shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <IconComponent className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-foreground">
                          {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        </span>
                        {isAnnual && plan.originalPrice !== plan.price && typeof plan.price === 'number' && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${plan.originalPrice}
                          </span>
                        )}
                      </div>
                      {plan.period && (
                        <div className="text-muted-foreground text-sm mt-1">
                          {plan.period}
                          {plan.trialDays > 0 && (
                            <div className="text-green-600 font-medium mt-1">
                              {plan.trialDays}-day free trial
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      variant={plan.buttonVariant}
                      onClick={() => handlePlanSelect(plan)}
                      disabled={paymentLoading || (currentSubscription?.plan === plan.id && currentSubscription?.status === 'active')}
                    >
                      {paymentLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        plan.buttonText
                      )}
                    </Button>

                    {/* Plan benefits summary */}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      {plan.id !== 'starter' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Unlimited users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Secure</span>
                          </div>
                        </>
                      )}
                      {plan.trialDays > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{plan.trialDays}-day trial</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-center gap-3">
                          <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions? We have answers. If you can't find what you're looking for, contact our support team.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust ominbiz to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Complete your subscription to unlock all features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Plan Summary */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{selectedPlan?.name} Plan</span>
                <span className="font-bold">
                  ${isAnnual ? selectedPlan?.price * 12 * 0.8 : selectedPlan?.price}
                  {isAnnual ? '/year' : '/month'}
                </span>
              </div>
              {isAnnual && (
                <div className="text-sm text-green-600 mt-1">
                  Save ${selectedPlan?.price * 12 * 0.2}/year with annual billing
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={paymentForm.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentForm.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={paymentForm.billingAddress.street}
                  onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                  placeholder="123 Main St"
                  className="mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={paymentForm.billingAddress.city}
                    onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={paymentForm.billingAddress.zipCode}
                    onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
                disabled={paymentLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={processPayment}
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default Pricing;
