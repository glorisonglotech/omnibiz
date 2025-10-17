import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    billing: 'Free Forever',
    description: 'Perfect for getting started',
    features: [
      '100 Products',
      '5 Team Members',
      'Basic Inventory',
      'Email Support',
      'Standard Features'
    ],
    limits: { products: 100, teamMembers: 5 },
    badge: 'Free',
    badgeColor: 'bg-green-600'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    billing: 'KES 2,999/month',
    description: 'For growing businesses',
    features: [
      'Unlimited Products',
      'Unlimited Team Members',
      'Advanced Inventory',
      'Priority Support',
      'Advanced Analytics',
      'API Access',
      'Custom Reports'
    ],
    limits: { products: -1, teamMembers: -1 },
    badge: 'Popular',
    badgeColor: 'bg-blue-600',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom',
    billing: 'Custom Pricing',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Dedicated Support',
      'Custom Features',
      'SLA Guarantee',
      'Training & Onboarding',
      'White Label Options',
      'Advanced Security'
    ],
    limits: { products: -1, teamMembers: -1 },
    badge: 'Enterprise',
    badgeColor: 'bg-purple-600'
  }
];

export default function Subscriptions() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        api.get('/subscriptions/current'),
        api.get('/subscriptions/usage')
      ]);
      
      setCurrentSubscription(subRes.data.subscription);
      setUsage(usageRes.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === 'starter') {
      try {
        await api.post('/subscriptions/activate', { planId: 'starter' });
        toast.success('Starter plan activated!');
        fetchSubscriptionData();
      } catch (error) {
        toast.error('Failed to activate plan');
      }
      return;
    }

    if (planId === 'enterprise') {
      toast.info('Contact sales for Enterprise plan');
      return;
    }

    // Redirect to payment for Professional plan
    toast.info('Subscription payment coming soon');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled. Access continues until end of billing period.');
      fetchSubscriptionData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = plans.find(p => p.id === (currentSubscription?.plan || 'starter'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Plan
            </span>
            <Badge className={`${currentPlan?.badgeColor} text-white`}>
              {currentPlan?.badge}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Plan</div>
              <div className="text-2xl font-bold">{currentPlan?.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={currentSubscription?.status === 'active' ? 'default' : 'destructive'}>
                {currentSubscription?.status || 'Active'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Billing</div>
              <div className="text-lg font-semibold">{currentPlan?.billing}</div>
            </div>
          </div>

          {currentSubscription?.nextBilling && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing: {new Date(currentSubscription.nextBilling).toLocaleDateString()}
            </div>
          )}

          {currentSubscription?.cancelAtPeriodEnd && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will end on {new Date(currentSubscription.nextBilling).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Current usage vs. plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Products Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </span>
                <span className="font-medium">
                  {usage.usage?.products || 0} 
                  {usage.limits?.products !== -1 ? ` / ${usage.limits?.products}` : ' (Unlimited)'}
                </span>
              </div>
              {usage.limits?.products !== -1 && (
                <Progress 
                  value={(usage.usage?.products / usage.limits?.products) * 100} 
                  className="h-2"
                />
              )}
            </div>

            {/* Team Members Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </span>
                <span className="font-medium">
                  {usage.usage?.teamMembers || 0}
                  {usage.limits?.teamMembers !== -1 ? ` / ${usage.limits?.teamMembers}` : ' (Unlimited)'}
                </span>
              </div>
              {usage.limits?.teamMembers !== -1 && (
                <Progress 
                  value={(usage.usage?.teamMembers / usage.limits?.teamMembers) * 100} 
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg' : ''} ${
                currentSubscription?.plan === plan.id ? 'bg-muted/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {currentSubscription?.plan === plan.id && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center py-4">
                  {typeof plan.price === 'number' ? (
                    <>
                      <div className="text-4xl font-bold">
                        KES {plan.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">{plan.billing}</div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={currentSubscription?.plan === plan.id ? 'outline' : 'default'}
                  disabled={currentSubscription?.plan === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {currentSubscription?.plan === plan.id
                    ? 'Current Plan'
                    : plan.id === 'enterprise'
                    ? 'Contact Sales'
                    : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      {currentSubscription?.plan !== 'starter' && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  Manage your payment methods and billing details
                </p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  You will continue to have access until the end of your billing period
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelSubscription}
              >
                Cancel Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
