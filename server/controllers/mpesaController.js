require('dotenv').config();
const axios = require('axios');
const Transaction = require('../models/mpesaModel');
const Wallet = require('../models/wallet');
const FinancialTransaction = require('../models/transaction');
const User = require('../models/user');
const { getIO } = require('../config/socket');

const {
  SAFARICOM_CONSUMER_KEY,
  SAFARICOM_CONSUMER_SECRET,
  SAFARICOM_PASSKEY,
  BUSINESS_SHORT_CODE,
  SAFARICOM_BASE_URL,
  CALLBACK_URL,
  CALLBACK_PATH,
  NGROK_URL,
} = process.env;

const baseUrl = SAFARICOM_BASE_URL || 'https://sandbox.safaricom.co.ke';

const getAccessToken = async () => {
  try {
    if (!SAFARICOM_CONSUMER_KEY || !SAFARICOM_CONSUMER_SECRET) {
      throw new Error('Missing Safaricom consumer key/secret in environment');
    }

    const auth = Buffer.from(`${SAFARICOM_CONSUMER_KEY}:${SAFARICOM_CONSUMER_SECRET}`).toString('base64');
    const url = `${baseUrl.replace(/\/$/, '')}/oauth/v1/generate?grant_type=client_credentials`;

    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response?.data?.access_token) {
      console.error('No access_token in response:', response.data);
      throw new Error('No access token returned from Safaricom');
    }

    return response.data.access_token;
  } catch (error) {
    console.error('Access token error:', error.message);
    throw new Error(`Error fetching access token from Safaricom: ${error.message}`);
  }
};

exports.initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, accountReference, transactionDesc } = req.body;
    const owner = req.user?._id;

    if (!owner) return res.status(401).json({ error: "Unauthorized: User not found." });
    if (!phone || !amount || !accountReference || !transactionDesc) {
      return res.status(400).json({ error: "Phone, amount, accountReference, and transactionDesc are required." });
    }

    // Get user details for real data
    const user = await User.findById(owner);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Use user's phone if not provided, otherwise sanitize provided phone
    const userPhone = user.phone || phone;
    const sanitizedPhone = normalizePhone(userPhone);
    console.log('Real User Phone:', sanitizedPhone);
    console.log('User:', user.name, user.email);

    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    console.log('Timestamp:', timestamp);

    const password = Buffer.from(`${BUSINESS_SHORT_CODE}${SAFARICOM_PASSKEY}${timestamp}`).toString('base64');
    console.log('Generated Password:', password);

    // ✅ Resilient callback URL logic
    let callbackUrl = CALLBACK_URL;

    if (!callbackUrl || callbackUrl.includes('localhost') || !callbackUrl.startsWith('https://')) {
      const ngrokBase = NGROK_URL?.trim();
      const path = CALLBACK_PATH?.trim() || '/api/mpesa/callback';
      callbackUrl = ngrokBase && ngrokBase.startsWith('https://') ? `${ngrokBase}${path}` : '';
    }

    if (!callbackUrl || !callbackUrl.startsWith('https://')) {
      throw new Error(`Invalid CallBackURL: ${callbackUrl}. Must be HTTPS and publicly accessible.`);
    }

    console.log('Final Callback URL:', callbackUrl);

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: sanitizedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: sanitizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    console.log('STK Push Payload:', payload);

    const stkUrl = `${baseUrl.replace(/\/$/, '')}/mpesa/stkpush/v1/processrequest`;
    const response = await axios.post(stkUrl, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('STK Push Response:', response.data);

    const tx = await Transaction.create({
      owner,
      phone: sanitizedPhone,
      amount,
      accountReference,
      transactionDesc,
      merchantRequestID: response?.data?.MerchantRequestID,
      checkoutRequestID: response?.data?.CheckoutRequestID,
      status: 'Pending',
    });

    // Emit real-time notification
    const io = getIO();
    io.to(`user_${owner}`).emit('mpesa_initiated', {
      phone: sanitizedPhone,
      amount,
      checkoutRequestID: response?.data?.CheckoutRequestID,
      message: 'Check your phone for the M-Pesa prompt'
    });

    res.status(200).json({ 
      message: 'STK Push initiated successfully. Check your phone for the M-Pesa prompt.', 
      data: tx,
      userPhone: sanitizedPhone,
      userName: user.name
    });
  } catch (err) {
    console.error("STK Push error:", err.response?.data || err.message);
    res.status(500).json({ error: "Error initiating STK Push: " + err.message });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const callback = Body?.stkCallback;

    if (!callback) return res.status(400).json({ error: "Invalid callback data." });

    let mpesaReceiptNumber = null;
    let phoneNumber = null;
    let amount = null;
    const metadata = callback.CallbackMetadata?.Item;
    
    if (metadata) {
      const receiptItem = metadata.find(i => i.Name === "MpesaReceiptNumber");
      const phoneItem = metadata.find(i => i.Name === "PhoneNumber");
      const amountItem = metadata.find(i => i.Name === "Amount");
      
      mpesaReceiptNumber = receiptItem ? receiptItem.Value : null;
      phoneNumber = phoneItem ? phoneItem.Value : null;
      amount = amountItem ? amountItem.Value : null;
    }

    const tx = await Transaction.findOneAndUpdate(
      { checkoutRequestID: callback.CheckoutRequestID },
      {
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        metadata: callback.CallbackMetadata,
        status: callback.ResultCode === 0 ? "Success" : "Failed",
        mpesaReceiptNumber,
      },
      { new: true }
    );

    // If payment successful, credit the user's wallet
    if (callback.ResultCode === 0 && tx) {
      try {
        // Get or create wallet
        let wallet = await Wallet.findOne({ userId: tx.owner });
        if (!wallet) {
          wallet = await Wallet.create({ userId: tx.owner });
        }
        
        // Credit wallet
        await wallet.credit(amount || tx.amount, 'mpesa');
        
        // Create financial transaction record
        const financialTx = await FinancialTransaction.create({
          userId: tx.owner,
          description: `M-Pesa payment - ${mpesaReceiptNumber || 'N/A'}`,
          amount: amount || tx.amount,
          type: 'income',
          category: 'mpesa_payment',
          status: 'completed',
          reference: mpesaReceiptNumber,
          notes: `M-Pesa STK Push payment. Phone: ${phoneNumber || tx.phone}`
        });
        
        // Emit real-time event
        const io = getIO();
        io.to(`user_${tx.owner}`).emit('payment_success', {
          type: 'mpesa',
          amount: amount || tx.amount,
          receipt: mpesaReceiptNumber,
          balance: wallet.balance,
          transaction: financialTx
        });
        
        console.log('✅ M-Pesa payment successful. Wallet credited:', wallet.balance);
      } catch (walletError) {
        console.error('❌ Error crediting wallet:', walletError);
      }
    } else if (callback.ResultCode !== 0 && tx) {
      // Payment failed - emit event
      const io = getIO();
      io.to(`user_${tx.owner}`).emit('payment_failed', {
        type: 'mpesa',
        reason: callback.ResultDesc,
        amount: amount || tx.amount
      });
    }

    res.status(200).json({ ResponseCode: "0", ResponseDesc: "Callback processed successfully" });
  } catch (err) {
    console.error("Callback error:", err.message);
    res.status(500).json({ error: "Error handling callback: " + err.message });
  }
};

function normalizePhone(msisdn) {
  let p = msisdn.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") && p.length === 9) p = "254" + p;
  if (p.startsWith("254") && p.length === 12) return p;
  return p.startsWith("254") ? p : "254" + p.slice(-9);
}
