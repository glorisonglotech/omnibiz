import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasFeatureAccess, canPerformAction, getUpgradeMessage, SUBSCRIPTION_FEATURES } from '@/utils/subscriptionAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Zap, Crown, ArrowRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Higher Order Component to protect routes based on subscription tier
 * @param {React.Component} Component - Component to wrap
 * @param {object} options - Configuration options
 * @returns {React.Component}
 */
export const withSubscriptionGate = (Component, options = {}) => {
  const {
    requiredFeature,
    requiredLimit,
    fallback = null,
    redirectTo = '/pricing',
    showUpgradeModal = true
  } = options;

  return function SubscriptionProtectedComponent(props) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      checkAccess();
    }, [user]);

    const checkAccess = () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      const userTier = user.subscriptionTier || 'client';

      // Check feature access
      if (requiredFeature) {
        const access = hasFeatureAccess(userTier, requiredFeature);
        setHasAccess(access);
        
        if (!access && showUpgradeModal) {
          setShowUpgrade(true);
        }
        return;
      }

      // Check limit access
      if (requiredLimit) {
        const { type, current } = requiredLimit;
        const canDo = canPerformAction(userTier, type, current);
        setHasAccess(canDo);
        
        if (!canDo && showUpgradeModal) {
          setShowUpgrade(true);
        }
        return;
      }

      // Default: allow access
      setHasAccess(true);
    };

    const handleUpgrade = () => {
      navigate(redirectTo);
    };

    if (!hasAccess) {
      if (fallback) {
        return fallback;
      }

      return (
        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={handleUpgrade}
          feature={requiredFeature}
          userTier={user?.subscriptionTier || 'client'}
        />
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Component to display when user doesn't have access
 */
export const UpgradePrompt = ({ isOpen, onClose, onUpgrade, feature, userTier }) => {
  const featureName = feature?.replace(/_/g, ' ').toLowerCase() || 'this feature';
  const message = getUpgradeMessage(userTier, feature);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Unlock with Professional Plan:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Unlimited products and orders
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Advanced analytics and AI insights
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Multi-location support
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  API access and custom integrations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Inline gate component for conditional rendering
 */
export const FeatureGate = ({ feature, children, fallback = null, showPrompt = true }) => {
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  const userTier = user?.subscriptionTier || 'client';
  const hasAccess = hasFeatureAccess(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return fallback;
  }

  if (showPrompt) {
    return (
      <>
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <Button
              onClick={() => setShowUpgrade(true)}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Lock className="mr-2 h-4 w-4" />
              Unlock Feature
            </Button>
          </div>
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        </div>

        <UpgradePrompt
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => navigate('/pricing')}
          feature={feature}
          userTier={userTier}
        />
      </>
    );
  }

  return null;
};

/**
 * Badge component to show if feature is locked
 */
export const FeatureBadge = ({ feature, showIfLocked = true }) => {
  const { user } = useAuth();
  const userTier = user?.subscriptionTier || 'client';
  const hasAccess = hasFeatureAccess(userTier, feature);

  if (hasAccess) {
    return null;
  }

  if (showIfLocked) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Lock className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    );
  }

  return null;
};

/**
 * Simple access checker hook
 */
export const useSubscriptionAccess = (feature) => {
  const { user } = useAuth();
  const userTier = user?.subscriptionTier || 'client';
  
  return {
    hasAccess: hasFeatureAccess(userTier, feature),
    tier: userTier,
    user
  };
};

export default {
  withSubscriptionGate,
  UpgradePrompt,
  FeatureGate,
  FeatureBadge,
  useSubscriptionAccess
};
