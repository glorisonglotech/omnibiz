const Wallet = require('../models/wallet');
const Transaction = require('../models/transaction');
const { getIO } = require('../config/socket');
const bcrypt = require('bcryptjs');

// Get or create wallet for user
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        currency: req.user.currency || 'KES'
      });
    }
    
    // Reset daily limit if needed
    wallet.resetDailyLimitIfNeeded();
    await wallet.save();
    
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};

// Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.json({ balance: 0, currency: 'KES' });
    }
    
    res.json({
      balance: wallet.balance,
      currency: wallet.currency,
      todaySpent: wallet.todaySpent,
      dailyLimit: wallet.dailyLimit,
      availableToday: Math.max(0, wallet.dailyLimit - wallet.todaySpent)
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

// Deposit funds to wallet
exports.deposit = async (req, res) => {
  try {
    const { amount, source, reference, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }
    
    // Credit wallet
    await wallet.credit(amount, source);
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user._id,
      description: description || `Wallet deposit from ${source || 'unknown'}`,
      amount,
      type: 'income',
      category: 'wallet_deposit',
      status: 'completed',
      reference,
      notes: `Deposited to wallet. New balance: ${wallet.currency} ${wallet.balance}`
    });
    
    // Emit real-time event
    const io = getIO();
    io.to(`user_${req.user._id}`).emit('wallet_updated', {
      balance: wallet.balance,
      transaction: transaction,
      type: 'deposit'
    });
    
    res.status(201).json({
      message: 'Deposit successful',
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency
      },
      transaction
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: error.message || 'Failed to process deposit' });
  }
};

// Withdraw funds from wallet
exports.withdraw = async (req, res) => {
  try {
    const { amount, destination, accountNumber, pin, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const wallet = await Wallet.findOne({ userId: req.user._id }).select('+pin');
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Verify PIN if set
    if (wallet.pin) {
      if (!pin) {
        return res.status(400).json({ error: 'PIN required' });
      }
      
      const pinValid = await bcrypt.compare(pin, wallet.pin);
      if (!pinValid) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }
    
    // Debit wallet (includes limit checks)
    await wallet.debit(amount, 'withdrawal');
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.user._id,
      description: description || `Withdrawal to ${destination || 'external account'}`,
      amount,
      type: 'expense',
      category: 'wallet_withdrawal',
      status: 'completed',
      reference: accountNumber,
      notes: `Withdrawn from wallet. New balance: ${wallet.currency} ${wallet.balance}`
    });
    
    // Emit real-time event
    const io = getIO();
    io.to(`user_${req.user._id}`).emit('wallet_updated', {
      balance: wallet.balance,
      transaction: transaction,
      type: 'withdrawal'
    });
    
    res.json({
      message: 'Withdrawal successful',
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency
      },
      transaction
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: error.message || 'Failed to process withdrawal' });
  }
};

// Internal transfer (between users)
exports.transfer = async (req, res) => {
  try {
    const { amount, recipientId, description, pin } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient required' });
    }
    
    // Get sender wallet
    const senderWallet = await Wallet.findOne({ userId: req.user._id }).select('+pin');
    if (!senderWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Verify PIN if set
    if (senderWallet.pin) {
      if (!pin) {
        return res.status(400).json({ error: 'PIN required' });
      }
      
      const pinValid = await bcrypt.compare(pin, senderWallet.pin);
      if (!pinValid) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }
    
    // Get or create recipient wallet
    let recipientWallet = await Wallet.findOne({ userId: recipientId });
    if (!recipientWallet) {
      recipientWallet = await Wallet.create({ userId: recipientId });
    }
    
    // Perform transfer
    await senderWallet.debit(amount, 'transfer');
    await recipientWallet.credit(amount, 'transfer');
    
    // Create transactions for both parties
    const senderTransaction = await Transaction.create({
      userId: req.user._id,
      description: description || `Transfer to user`,
      amount,
      type: 'expense',
      category: 'wallet_transfer',
      status: 'completed',
      reference: recipientId,
      notes: `Sent to user ${recipientId}. New balance: ${senderWallet.currency} ${senderWallet.balance}`
    });
    
    const recipientTransaction = await Transaction.create({
      userId: recipientId,
      description: description || `Transfer from user`,
      amount,
      type: 'income',
      category: 'wallet_transfer',
      status: 'completed',
      reference: req.user._id,
      notes: `Received from user ${req.user._id}. New balance: ${recipientWallet.currency} ${recipientWallet.balance}`
    });
    
    // Emit real-time events
    const io = getIO();
    io.to(`user_${req.user._id}`).emit('wallet_updated', {
      balance: senderWallet.balance,
      transaction: senderTransaction,
      type: 'transfer_out'
    });
    
    io.to(`user_${recipientId}`).emit('wallet_updated', {
      balance: recipientWallet.balance,
      transaction: recipientTransaction,
      type: 'transfer_in'
    });
    
    res.json({
      message: 'Transfer successful',
      sender: {
        balance: senderWallet.balance,
        transaction: senderTransaction
      },
      recipient: {
        transaction: recipientTransaction
      }
    });
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ error: error.message || 'Failed to process transfer' });
  }
};

// Set or update PIN
exports.setPin = async (req, res) => {
  try {
    const { pin, currentPin } = req.body;
    
    if (!pin || pin.length < 4) {
      return res.status(400).json({ error: 'PIN must be at least 4 characters' });
    }
    
    const wallet = await Wallet.findOne({ userId: req.user._id }).select('+pin');
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Verify current PIN if it exists
    if (wallet.pin) {
      if (!currentPin) {
        return res.status(400).json({ error: 'Current PIN required' });
      }
      
      const pinValid = await bcrypt.compare(currentPin, wallet.pin);
      if (!pinValid) {
        return res.status(401).json({ error: 'Invalid current PIN' });
      }
    }
    
    // Hash and save new PIN
    wallet.pin = await bcrypt.hash(pin, 10);
    await wallet.save();
    
    res.json({ message: 'PIN updated successfully' });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
};

// Verify PIN
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    
    if (!pin) {
      return res.status(400).json({ error: 'PIN required' });
    }
    
    const wallet = await Wallet.findOne({ userId: req.user._id }).select('+pin');
    
    if (!wallet || !wallet.pin) {
      return res.status(400).json({ error: 'PIN not set' });
    }
    
    const pinValid = await bcrypt.compare(pin, wallet.pin);
    
    res.json({ verified: pinValid });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
};

// Get transaction limits
exports.getLimits = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.json({
        daily: 100000,
        perTransaction: 50000,
        todaySpent: 0,
        availableToday: 100000
      });
    }
    
    wallet.resetDailyLimitIfNeeded();
    await wallet.save();
    
    res.json({
      daily: wallet.dailyLimit,
      perTransaction: wallet.perTransactionLimit,
      todaySpent: wallet.todaySpent,
      availableToday: Math.max(0, wallet.dailyLimit - wallet.todaySpent)
    });
  } catch (error) {
    console.error('Error fetching limits:', error);
    res.status(500).json({ error: 'Failed to fetch limits' });
  }
};

// Update transaction limits (admin or user)
exports.updateLimits = async (req, res) => {
  try {
    const { dailyLimit, perTransactionLimit } = req.body;
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    if (dailyLimit !== undefined) wallet.dailyLimit = dailyLimit;
    if (perTransactionLimit !== undefined) wallet.perTransactionLimit = perTransactionLimit;
    
    await wallet.save();
    
    res.json({
      message: 'Limits updated successfully',
      limits: {
        daily: wallet.dailyLimit,
        perTransaction: wallet.perTransactionLimit
      }
    });
  } catch (error) {
    console.error('Error updating limits:', error);
    res.status(500).json({ error: 'Failed to update limits' });
  }
};

// Get wallet transaction history
exports.getWalletTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const filter = {
      userId: req.user._id,
      category: { 
        $in: ['wallet_deposit', 'wallet_withdrawal', 'wallet_transfer', 'mpesa_payment', 'paypal_payment'] 
      }
    };
    
    if (type) filter.type = type;
    
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Connect payment account
exports.connectAccount = async (req, res) => {
  try {
    const { type, accountName, accountNumber, provider } = req.body;
    
    if (!type || !accountNumber) {
      return res.status(400).json({ error: 'Type and account number required' });
    }
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Check if account already exists
    const existingAccount = wallet.connectedAccounts.find(
      acc => acc.accountNumber === accountNumber && acc.type === type
    );
    
    if (existingAccount) {
      return res.status(400).json({ error: 'Account already connected' });
    }
    
    // Add new account
    wallet.connectedAccounts.push({
      type,
      accountName,
      accountNumber,
      provider,
      isDefault: wallet.connectedAccounts.length === 0,
      verified: false
    });
    
    await wallet.save();
    
    res.status(201).json({
      message: 'Account connected successfully',
      account: wallet.connectedAccounts[wallet.connectedAccounts.length - 1]
    });
  } catch (error) {
    console.error('Error connecting account:', error);
    res.status(500).json({ error: 'Failed to connect account' });
  }
};

// Get connected accounts
exports.getConnectedAccounts = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.json([]);
    }
    
    res.json(wallet.connectedAccounts);
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

// Remove connected account
exports.disconnectAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    wallet.connectedAccounts = wallet.connectedAccounts.filter(
      acc => acc._id.toString() !== accountId
    );
    
    await wallet.save();
    
    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
};

module.exports = exports;
