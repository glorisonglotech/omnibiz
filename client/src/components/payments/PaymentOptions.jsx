import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, Banknote, Shield, Clock } from 'lucide-react';
import MpesaPayment from './MpesaPayment';
import PayPalPayment from './PayPalPayment';

const PaymentOptions = ({ 
  amount, 
  description, 
  currency = 'KES', 
  onSuccess, 
  onError, 
  disabled = false,
  triggerText = 'Make Payment',
  showMpesa = true,
  showPaypal = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePaymentSuccess = (paymentData) => {
    setIsOpen(false);
    if (onSuccess) onSuccess(paymentData);
  };

  const handlePaymentError = (error) => {
    if (onError) onError(error);
  };

  const formatAmount = (amt, curr) => {
    if (curr === 'KES') {
      return `KES ${amt?.toLocaleString()}`;
    } else if (curr === 'USD') {
      return `$${amt?.toLocaleString()}`;
    }
    return `${curr} ${amt?.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-primary hover:bg-primary/90">
          <CreditCard className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Payment Options
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for {formatAmount(amount, currency)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{formatAmount(amount, currency)}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-sm">{description}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Tabs defaultValue={showMpesa ? "mpesa" : "paypal"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {showMpesa && (
                <TabsTrigger value="mpesa" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa
                </TabsTrigger>
              )}
              {showPaypal && (
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  PayPal
                </TabsTrigger>
              )}
            </TabsList>

            {showMpesa && (
              <TabsContent value="mpesa" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Smartphone className="h-5 w-5" />
                      M-Pesa Payment
                    </CardTitle>
                    <CardDescription>
                      Pay instantly using your Safaricom M-Pesa mobile money
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>Instant payment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Secure & trusted</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <MpesaPayment
                        amount={currency === 'KES' ? amount : Math.round(amount * 130)} // Convert USD to KES approximately
                        description={description}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {showPaypal && (
              <TabsContent value="paypal" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <CreditCard className="h-5 w-5" />
                      PayPal Payment
                    </CardTitle>
                    <CardDescription>
                      Pay with PayPal, credit card, or debit card
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span>Buyer protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <span>Cards accepted</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <PayPalPayment
                        amount={currency === 'USD' ? amount : Math.round(amount / 130 * 100) / 100} // Convert KES to USD approximately
                        description={description}
                        currency="USD"
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Security Notice */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and processed securely. 
                  We never store your payment details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentOptions;
