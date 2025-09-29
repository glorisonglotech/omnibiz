import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const MpesaPayment = ({ amount, description, onSuccess, onError, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'
  const [transactionId, setTransactionId] = useState('');

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      const token = localStorage.getItem('token');
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await api.post('/payments/mpesa/initiate', {
        phoneNumber: formattedPhone,
        amount: amount,
        description: description || 'Payment for OmniBiz services'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        toast.success('Payment request sent! Please check your phone for the M-Pesa prompt.');
        
        // Poll for payment status
        pollPaymentStatus(response.data.transactionId);
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus('failed');
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      toast.error(errorMessage);
      if (onError) onError(error);
    }
  };

  const pollPaymentStatus = async (txnId) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/payments/mpesa/status/${txnId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const status = response.data.status;

        if (status === 'completed') {
          setPaymentStatus('success');
          setIsProcessing(false);
          toast.success('Payment completed successfully!');
          if (onSuccess) onSuccess(response.data);
          setTimeout(() => setIsOpen(false), 2000);
        } else if (status === 'failed' || status === 'cancelled') {
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment was cancelled or failed');
          if (onError) onError(new Error('Payment failed'));
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000); // Check again in 10 seconds
        } else {
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Payment timeout. Please try again.');
          if (onError) onError(new Error('Payment timeout'));
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000);
        } else {
          setPaymentStatus('failed');
          setIsProcessing(false);
          toast.error('Unable to verify payment status');
          if (onError) onError(error);
        }
      }
    };

    checkStatus();
  };

  const resetPayment = () => {
    setPaymentStatus(null);
    setIsProcessing(false);
    setTransactionId('');
    setPhoneNumber('');
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
      resetPayment();
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Smartphone className="h-8 w-8 text-primary" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Waiting for payment confirmation...';
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Enter your M-Pesa number to proceed';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)} 
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Pay with M-Pesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Pay KES {amount?.toLocaleString()} using M-Pesa
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
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678 or 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Safaricom M-Pesa number
                  </p>
                </div>
                
                <Button 
                  onClick={handlePayment} 
                  disabled={!phoneNumber || isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-4 w-4" />
                      Send Payment Request
                    </>
                  )}
                </Button>
              </div>
            )}

            {paymentStatus === 'pending' && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Check your phone for M-Pesa prompt
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Transaction ID: {transactionId}
                </p>
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
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPayment;
