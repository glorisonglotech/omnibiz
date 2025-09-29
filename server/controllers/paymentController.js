const axios = require('axios');
const crypto = require('crypto');
const Transaction = require('../models/transaction');

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/payments/mpesa/callback',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox' // 'sandbox' or 'production'
};

// PayPal Configuration
const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox' // 'sandbox' or 'live'
};

// Get M-Pesa access token
const getMpesaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    const baseUrl = MPESA_CONFIG.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to authenticate with M-Pesa');
  }
};

// Generate M-Pesa password
const generateMpesaPassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Initiate M-Pesa STK Push
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, description } = req.body;
    const userId = req.user.id;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and amount are required' 
      });
    }

    const accessToken = await getMpesaAccessToken();
    const { password, timestamp } = generateMpesaPassword();
    const transactionId = `OMNIBIZ_${Date.now()}_${userId}`;

    const baseUrl = MPESA_CONFIG.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';

    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: transactionId,
      TransactionDesc: description || 'Payment for OmniBiz services'
    };

    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      // Store transaction in database
      const transaction = new Transaction({
        userId,
        description: description || 'M-Pesa payment',
        amount: Math.round(amount),
        type: 'income',
        category: 'service',
        status: 'pending',
        reference: transactionId,
        notes: `M-Pesa payment from ${phoneNumber}`
      });
      
      await transaction.save();

      res.json({
        success: true,
        message: 'STK push sent successfully',
        transactionId: transactionId,
        checkoutRequestId: response.data.CheckoutRequestID
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.data.ResponseDescription || 'STK push failed'
      });
    }
  } catch (error) {
    console.error('M-Pesa payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment'
    });
  }
};

// M-Pesa callback handler
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;
    
    if (ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;
      
      const amount = items.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;
      
      // Update transaction status
      await Transaction.findOneAndUpdate(
        { reference: { $regex: CheckoutRequestID } },
        { 
          status: 'completed',
          notes: `M-Pesa payment completed. Receipt: ${mpesaReceiptNumber}`
        }
      );
      
      console.log('M-Pesa payment successful:', { amount, mpesaReceiptNumber, phoneNumber });
    } else {
      // Payment failed
      await Transaction.findOneAndUpdate(
        { reference: { $regex: CheckoutRequestID } },
        { status: 'failed' }
      );
      
      console.log('M-Pesa payment failed:', ResultDesc);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ success: false });
  }
};

// Check M-Pesa payment status
exports.checkMpesaPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;
    
    const transaction = await Transaction.findOne({
      reference: transactionId,
      userId: userId
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      status: transaction.status,
      transaction: transaction
    });
  } catch (error) {
    console.error('Error checking M-Pesa payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
};

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const baseUrl = PAYPAL_CONFIG.environment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
    
    const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64');
    
    const response = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error('Failed to authenticate with PayPal');
  }
};

// Create PayPal order
exports.createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    const userId = req.user.id;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = PAYPAL_CONFIG.environment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency || 'USD',
          value: amount.toFixed(2)
        },
        description: description || 'Payment for OmniBiz services'
      }]
    };

    const response = await axios.post(
      `${baseUrl}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.id) {
      // Store transaction in database
      const transaction = new Transaction({
        userId,
        description: description || 'PayPal payment',
        amount: parseFloat(amount),
        type: 'income',
        category: 'service',
        status: 'pending',
        reference: response.data.id,
        notes: `PayPal payment order created`
      });
      
      await transaction.save();

      res.json({
        success: true,
        orderID: response.data.id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create PayPal order'
      });
    }
  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal order'
    });
  }
};

// Capture PayPal order
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    const userId = req.user.id;

    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = PAYPAL_CONFIG.environment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    const response = await axios.post(
      `${baseUrl}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      // Update transaction status
      await Transaction.findOneAndUpdate(
        { reference: orderID, userId: userId },
        { 
          status: 'completed',
          notes: `PayPal payment completed. Transaction ID: ${response.data.id}`
        }
      );

      res.json({
        success: true,
        transactionId: response.data.id,
        paymentData: response.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment capture failed'
      });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture PayPal payment'
    });
  }
};
