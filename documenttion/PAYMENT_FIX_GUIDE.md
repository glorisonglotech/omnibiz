# M-Pesa Payment Error Fix Guide

## Problem Analysis
The error "M-Pesa payment error: AxiosError" indicates the API request is failing. The backend routes exist but may be missing configuration.

---

## Quick Fix Checklist

### 1. **Environment Variables** (CRITICAL)
Create/update `.env` file in the `server` directory:

```env
# M-Pesa Configuration (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_ENVIRONMENT=sandbox

# Server
PORT=5000
NODE_ENV=development
NGROK_ENABLED=true
```

### 2. **Get M-Pesa Sandbox Credentials**
1. Visit: https://developer.safaricom.co.ke/
2. Register/Login
3. Create a new app
4. Get Consumer Key and Consumer Secret
5. Get Test Credentials (Passkey)

### 3. **Start Backend Server**
```bash
cd server
npm install
npm start
```

### 4. **Verify API Connection**
Open browser and check:
- http://localhost:5000/ - Should show "OmniBiz Pro API Server is running!"
- Check console for any startup errors

---

## Alternative: Mock Payment for Testing

If you can't get M-Pesa credentials immediately, use this temporary mock payment:

**File:** `client/src/components/payments/MockMpesaPayment.jsx`

```jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const MockMpesaPayment = ({ amount, description, onSuccess, onError, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMockPayment = async () => {
    setIsProcessing(true);
    toast.info('Simulating M-Pesa payment...');
    
    // Simulate API delay
    setTimeout(() => {
      const mockData = {
        success: true,
        transactionId: `MOCK_${Date.now()}`,
        amount: amount,
        phoneNumber: phoneNumber,
        timestamp: new Date().toISOString()
      };
      
      setIsProcessing(false);
      toast.success('Mock payment completed!');
      if (onSuccess) onSuccess(mockData);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)} 
          disabled={disabled}
          className="bg-green-600 hover:bg-green-700"
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Pay with M-Pesa (Mock)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mock M-Pesa Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount</Label>
            <div className="text-2xl font-bold">KES {amount?.toLocaleString()}</div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <Button 
            onClick={handleMockPayment}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Complete Mock Payment'}
          </Button>
          <p className="text-xs text-muted-foreground">
            This is a mock payment for testing. No real transaction will occur.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MockMpesaPayment;
```

Then in `PaymentOptions.jsx`, temporarily import this instead:
```javascript
import MpesaPayment from './MockMpesaPayment'; // Use this for testing
```

---

## Common Errors & Solutions

### Error: "Network Error"
- **Cause:** Backend server not running
- **Solution:** Start server with `cd server && npm start`

### Error: "401 Unauthorized"
- **Cause:** Missing or invalid M-Pesa credentials
- **Solution:** Check `.env` file has correct MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET

### Error: "404 Not Found"
- **Cause:** Wrong API endpoint
- **Solution:** Verify frontend is calling `/api/payments/mpesa/initiate`

### Error: "Timeout"
- **Cause:** M-Pesa API taking too long
- **Solution:** Increase timeout in `api.js` or check internet connection

---

## Production Deployment

### 1. Get Production Credentials
- Apply for M-Pesa Go-Live approval
- Get production Consumer Key, Secret, and Passkey
- Set up production Business ShortCode

### 2. Update Environment
```env
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://your-production-domain.com/api/payments/mpesa/callback
```

### 3. SSL Certificate Required
M-Pesa requires HTTPS for callbacks in production.

---

## Testing Steps

1. **Start Backend**
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

3. **Test Payment Flow**
   - Navigate to `/dashboard/checkout`
   - Add items to cart
   - Proceed through checkout steps
   - Click "Pay with M-Pesa"
   - Enter phone number: 254708374149 (sandbox test number)
   - Check for STK push prompt

4. **Check Logs**
   - Backend console: Look for "M-Pesa payment initiation"
   - Frontend console: Look for errors
   - Network tab: Check `/api/payments/mpesa/initiate` request

---

## Support Resources

- **M-Pesa API Docs:** https://developer.safaricom.co.ke/Documentation
- **Sandbox Test Credentials:** Use provided test numbers
- **Callback Testing:** Use Ngrok for local development

---

**Status:** Ready to fix  
**Estimated Time:** 15-30 minutes  
**Difficulty:** Medium
