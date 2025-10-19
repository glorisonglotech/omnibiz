import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const PayPalPayment = ({ amount, description, currency = 'USD', onSuccess, onError, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalButtons, setPaypalButtons] = useState(null);

  // Load PayPal SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.paypal) {
      const script = document.createElement('script');
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'demo_client_id';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        setPaypalLoaded(false);
        // Don't show error toast immediately, let user try to open dialog first
      };
      document.body.appendChild(script);
    } else if (window.paypal) {
      setPaypalLoaded(true);
    }
  }, [currency]);

  // Initialize PayPal buttons when modal opens and PayPal is loaded
  useEffect(() => {
    if (isOpen && paypalLoaded && window.paypal && !paypalButtons) {
      initializePayPalButtons();
    }
  }, [isOpen, paypalLoaded, paypalButtons]);

  const initializePayPalButtons = () => {
    if (!window.paypal) return;

    const buttons = window.paypal.Buttons({
      createOrder: async (data, actions) => {
        try {
          setIsProcessing(true);
          const token = localStorage.getItem('token');
          
          const response = await api.post('/payments/paypal/create-order', {
            amount: amount,
            currency: currency,
            description: description || 'Payment for ominbiz services'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            return response.data.orderID;
          } else {
            throw new Error(response.data.message || 'Failed to create PayPal order');
          }
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          setIsProcessing(false);
          toast.error('Failed to create payment order');
          if (onError) onError(error);
          return null;
        }
      },

      onApprove: async (data, actions) => {
        try {
          const token = localStorage.getItem('token');
          
          const response = await api.post('/payments/paypal/capture-order', {
            orderID: data.orderID
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setPaymentStatus('success');
            setIsProcessing(false);
            toast.success('Payment completed successfully!');
            if (onSuccess) onSuccess(response.data);
            setTimeout(() => setIsOpen(false), 2000);
          } else {
            throw new Error(response.data.message || 'Payment capture failed');
          }
        } catch (error) {
          console.error('Error capturing PayPal payment:', error);
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment failed to complete');
          if (onError) onError(error);
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        setPaymentStatus('failed');
        setIsProcessing(false);
        toast.error('PayPal payment error occurred');
        if (onError) onError(err);
      },

      onCancel: (data) => {
        console.log('PayPal payment cancelled:', data);
        setIsProcessing(false);
        toast.info('Payment was cancelled');
      },

      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
        height: 40
      }
    });

    // Render PayPal buttons
    const container = document.getElementById('paypal-button-container');
    if (container && container.children.length === 0) {
      buttons.render('#paypal-button-container').then(() => {
        setPaypalButtons(buttons);
      }).catch((error) => {
        console.error('Error rendering PayPal buttons:', error);
        toast.error('Failed to load PayPal payment options');
      });
    }
  };

  const resetPayment = () => {
    setPaymentStatus(null);
    setIsProcessing(false);
    // Clear PayPal buttons container
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
    setPaypalButtons(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
      resetPayment();
    }
  };

  const handleOpenChange = (open) => {
    if (open) {
      setIsOpen(true);
      resetPayment();
    } else {
      handleClose();
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <CreditCard className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Choose your payment method below';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Pay with PayPal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            PayPal Payment
          </DialogTitle>
          <DialogDescription>
            Pay {currency} {amount?.toLocaleString()} using PayPal
          </DialogDescription>
        </DialogHeader>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {getStatusIcon()}
              <p className="text-sm text-muted-foreground">
                {getStatusMessage()}
              </p>
            </div>

            {!paymentStatus && (
              <div className="mt-6 space-y-4">
                {!paypalLoaded ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading PayPal...
                    </span>
                  </div>
                ) : (
                  <>
                    <div 
                      id="paypal-button-container" 
                      className="min-h-[50px]"
                    ></div>
                    
                    {isProcessing && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Processing payment...
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Payment was not completed. Please try again.
                  </p>
                </div>
                <Button 
                  onClick={resetPayment} 
                  variant="outline" 
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                <span>Secured by PayPal</span>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalPayment;
