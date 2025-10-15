import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Receipt,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowLeftRight,
  PiggyBank,
  Send,
  Landmark,
  ChartLine,
  Shield,
  Lock,
  Link as LinkIcon,
  Unlink,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';
import { toast } from 'sonner';

const Wallet = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, connected } = useSocket();
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    availableFunds: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Dialog states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  
  // Form states
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: 'bank', bankAccount: '', description: '' });
  const [depositData, setDepositData] = useState({ amount: '', method: 'mpesa', reference: '', description: '' });
  const [investData, setInvestData] = useState({ amount: '', plan: 'fixed', duration: '12', expectedReturn: '' });
  const [transferData, setTransferData] = useState({ amount: '', recipient: '', accountNumber: '', description: '' });
  
  // Security states
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [transactionLimits, setTransactionLimits] = useState({
    daily: 50000,
    perTransaction: 20000,
    todaySpent: 0
  });
  
  // Additional feature states
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [recurringData, setRecurringData] = useState({ amount: '', recipient: '', frequency: 'monthly', startDate: '' });
  const [budgetData, setBudgetData] = useState({ category: '', limit: '', period: 'monthly' });
  const [budgets, setBudgets] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState([]);
  
  // Payment gateway states
  const [isLinkAccountOpen, setIsLinkAccountOpen] = useState(false);
  const [isExternalTransferOpen, setIsExternalTransferOpen] = useState(false);
  const [isWalletSettingsOpen, setIsWalletSettingsOpen] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [walletSettings, setWalletSettings] = useState({
    transactionNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    autoSaveReceipts: true,
    currency: 'KES',
    language: 'en',
    theme: 'auto'
  });
  const [linkAccountData, setLinkAccountData] = useState({
    provider: '',
    accountType: '',
    phoneNumber: '',
    email: '',
    accountNumber: '',
    accountName: ''
  });
  const [externalTransferData, setExternalTransferData] = useState({
    provider: '',
    accountId: '',
    amount: '',
    recipient: '',
    description: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData();
      fetchTransactionLimits();
      fetchBudgets();
      fetchRecurringPayments();
      fetchConnectedAccounts();
      fetchWalletSettings();
      setupRealtimeListeners();
    }
  }, [isAuthenticated]);
  
  // Real-time WebSocket listeners
  const setupRealtimeListeners = () => {
    if (!socket) return;
    
    // Listen for real-time balance updates
    socket.on('wallet_balance_update', (data) => {
      setWalletData(prev => ({
        ...prev,
        balance: data.balance,
        availableFunds: data.availableFunds
      }));
      toast.info('Balance updated', { duration: 2000 });
    });
    
    // Listen for new transactions
    socket.on('wallet_transaction', (transaction) => {
      setTransactions(prev => [transaction, ...prev]);
      toast.success(`New transaction: ${transaction.type}`, { duration: 3000 });
      fetchWalletData(); // Refresh wallet data
    });
    
    // Listen for transaction status updates
    socket.on('transaction_status_update', (data) => {
      setTransactions(prev => prev.map(t => 
        t.id === data.transactionId ? { ...t, status: data.status } : t
      ));
      toast.info(`Transaction ${data.transactionId} ${data.status}`);
    });
    
    return () => {
      socket.off('wallet_balance_update');
      socket.off('wallet_transaction');
      socket.off('transaction_status_update');
    };
  };
  
  // Fetch transaction limits
  const fetchTransactionLimits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/wallet/limits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactionLimits(response.data);
    } catch (error) {
      // Use default limits if endpoint doesn't exist
      if (error.response?.status === 404) {
        setTransactionLimits({
          daily: 50000,
          perTransaction: 20000,
          todaySpent: 0
        });
      }
    }
  };
  
  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/wallet/budgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(response.data || []);
    } catch (error) {
      // Silently fail if endpoint doesn't exist
      if (error.response?.status === 404) {
        setBudgets([]);
      }
    }
  };
  
  // Fetch recurring payments
  const fetchRecurringPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/wallet/recurring', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecurringPayments(response.data || []);
    } catch (error) {
      // Silently fail if endpoint doesn't exist
      if (error.response?.status === 404) {
        setRecurringPayments([]);
      }
    }
  };
  
  // Fetch connected payment accounts
  const fetchConnectedAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/wallet/connected-accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConnectedAccounts(response.data || []);
    } catch (error) {
      // Silently fail if endpoint doesn't exist
      if (error.response?.status === 404) {
        setConnectedAccounts([]);
      }
    }
  };
  
  // Fetch wallet settings
  const fetchWalletSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/wallet/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletSettings(response.data || walletSettings);
    } catch (error) {
      // Use default settings or load from localStorage if endpoint doesn't exist
      if (error.response?.status === 404) {
        const savedSettings = localStorage.getItem('walletSettings');
        if (savedSettings) {
          try {
            setWalletSettings(JSON.parse(savedSettings));
          } catch (e) {
            // Keep default settings if parse fails
          }
        }
      }
    }
  };
  
  // Update wallet settings
  const handleUpdateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/wallet/settings', {
        ...walletSettings,
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Wallet settings updated successfully!');
      setIsWalletSettingsOpen(false);
    } catch (error) {
      // Handle missing endpoint gracefully
      if (error.response?.status === 404) {
        // Save to localStorage as fallback
        localStorage.setItem('walletSettings', JSON.stringify(walletSettings));
        toast.success('Settings saved locally!');
        setIsWalletSettingsOpen(false);
      } else {
        toast.error('Failed to update settings');
      }
    }
  };
  
  // Link external payment account
  const handleLinkAccount = async () => {
    if (!linkAccountData.provider) {
      toast.error('Please select a payment provider');
      return;
    }
    
    // Validate based on provider
    if (linkAccountData.provider === 'mpesa' && !linkAccountData.phoneNumber) {
      toast.error('Please enter M-Pesa phone number');
      return;
    }
    
    if (linkAccountData.provider === 'paypal' && !linkAccountData.email) {
      toast.error('Please enter PayPal email');
      return;
    }
    
    if (linkAccountData.provider === 'bank' && !linkAccountData.accountNumber) {
      toast.error('Please enter bank account number');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/wallet/link-account', {
        ...linkAccountData,
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`${linkAccountData.provider.toUpperCase()} account linked successfully!`);
      setIsLinkAccountOpen(false);
      setLinkAccountData({
        provider: '',
        accountType: '',
        phoneNumber: '',
        email: '',
        accountNumber: '',
        accountName: ''
      });
      await fetchConnectedAccounts();
    } catch (error) {
      console.error('Link account error:', error);
      toast.error('Failed to link account. Please try again.');
    }
  };
  
  // External transfer to connected account
  const handleExternalTransfer = async () => {
    if (!externalTransferData.provider || !externalTransferData.accountId) {
      toast.error('Please select a destination account');
      return;
    }
    
    if (!externalTransferData.amount || parseFloat(externalTransferData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(externalTransferData.amount) > walletData.availableFunds) {
      toast.error('Insufficient funds');
      return;
    }
    
    if (!checkTransactionLimit(parseFloat(externalTransferData.amount))) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/wallet/external-transfer', {
        ...externalTransferData,
        amount: parseFloat(externalTransferData.amount),
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Emit real-time update
      if (socket && connected) {
        socket.emit('wallet_action', {
          type: 'external_transfer',
          amount: parseFloat(externalTransferData.amount),
          provider: externalTransferData.provider,
          userId: user?._id
        });
      }
      
      toast.success(`Transfer to ${externalTransferData.provider.toUpperCase()} initiated successfully!`);
      setIsExternalTransferOpen(false);
      setExternalTransferData({
        provider: '',
        accountId: '',
        amount: '',
        recipient: '',
        description: ''
      });
      await fetchWalletData();
      await fetchTransactionLimits();
    } catch (error) {
      console.error('External transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    }
  };
  
  // Disconnect payment account
  const handleDisconnectAccount = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/wallet/connected-accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Account disconnected successfully');
      await fetchConnectedAccounts();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data from multiple endpoints in parallel
      const [ordersRes, invoicesRes, paymentsRes] = await Promise.allSettled([
        api.get('/orders', { headers }),
        api.get('/invoices', { headers }),
        api.get('/payments', { headers })
      ]);

      // Extract data safely
      const orders = ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : []) : [];
      const invoices = invoicesRes.status === 'fulfilled' ? (Array.isArray(invoicesRes.value?.data) ? invoicesRes.value.data : []) : [];
      const payments = paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value?.data) ? paymentsRes.value.data : []) : [];

      // Calculate wallet metrics
      const totalIncome = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, order) => sum + parseFloat(order.total || order.amount || 0), 0);

      const totalExpenses = payments
        .filter(p => p.type === 'expense' || p.type === 'refund')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      const pendingPayments = invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'sent')
        .reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);

      const balance = totalIncome - totalExpenses;
      const availableFunds = balance - pendingPayments;

      setWalletData({
        balance,
        totalIncome,
        totalExpenses,
        pendingPayments,
        availableFunds
      });

      // Build transactions list
      const allTransactions = [
        ...orders.map(order => ({
          id: order._id,
          type: 'income',
          category: 'sale',
          description: `Order #${order.orderNumber || order._id?.slice(-6)} - ${order.customerName || 'Customer'}`,
          amount: parseFloat(order.total || order.amount || 0),
          currency: order.currency || 'KES',
          status: order.status,
          date: new Date(order.createdAt),
          method: order.paymentMethod || 'Card'
        })),
        ...invoices.map(invoice => ({
          id: invoice._id,
          type: invoice.status === 'paid' ? 'income' : 'pending',
          category: 'invoice',
          description: `Invoice #${invoice.invoiceNumber || invoice._id?.slice(-6)} - ${invoice.clientName || 'Client'}`,
          amount: parseFloat(invoice.total || 0),
          currency: invoice.currency || 'KES',
          status: invoice.status,
          date: new Date(invoice.createdAt),
          method: invoice.paymentMethod || 'Bank Transfer'
        })),
        ...payments.map(payment => ({
          id: payment._id,
          type: 'expense',
          category: payment.category || 'expense',
          description: payment.description || `Payment ${payment._id?.slice(-6)}`,
          amount: parseFloat(payment.amount || 0),
          currency: payment.currency || 'KES',
          status: payment.status || 'completed',
          date: new Date(payment.createdAt || payment.date),
          method: payment.method || 'Cash'
        }))
      ].sort((a, b) => b.date - a.date);

      setTransactions(allTransactions);

      // Calculate currency breakdown
      const currencyMap = {};
      allTransactions.forEach(trans => {
        if (!currencyMap[trans.currency]) {
          currencyMap[trans.currency] = { income: 0, expenses: 0, balance: 0 };
        }
        if (trans.type === 'income') {
          currencyMap[trans.currency].income += trans.amount;
        } else if (trans.type === 'expense') {
          currencyMap[trans.currency].expenses += trans.amount;
        }
        currencyMap[trans.currency].balance = currencyMap[trans.currency].income - currencyMap[trans.currency].expenses;
      });

      setCurrencies(Object.entries(currencyMap).map(([code, data]) => ({
        code,
        ...data
      })));

      console.log('✅ Wallet data loaded:', {
        balance,
        transactions: allTransactions.length,
        currencies: Object.keys(currencyMap).length
      });

    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
    toast.success('Wallet data refreshed!');
  };

  // Security verification
  const requireSecurity = (action, data) => {
    setPendingAction({ action, data });
    setIsSecurityOpen(true);
  };
  
  const verifySecurityPin = async () => {
    if (!securityPin || securityPin.length < 4) {
      toast.error('Please enter a valid PIN');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/wallet/verify-pin', {
        pin: securityPin,
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.verified) {
        setIsSecurityOpen(false);
        setSecurityPin('');
        
        // Execute pending action
        if (pendingAction) {
          switch (pendingAction.action) {
            case 'withdraw':
              await executeWithdraw(pendingAction.data);
              break;
            case 'transfer':
              await executeTransfer(pendingAction.data);
              break;
            case 'invest':
              await executeInvest(pendingAction.data);
              break;
          }
          setPendingAction(null);
        }
      } else {
        toast.error('Invalid PIN');
      }
    } catch (error) {
      toast.error('Security verification failed');
      console.error('PIN verification error:', error);
    }
  };
  
  // Check transaction limits
  const checkTransactionLimit = (amount) => {
    if (amount > transactionLimits.perTransaction) {
      toast.error(`Transaction limit is KES ${transactionLimits.perTransaction.toLocaleString()}`);
      return false;
    }
    
    if (transactionLimits.todaySpent + amount > transactionLimits.daily) {
      toast.error(`Daily limit exceeded. Remaining: KES ${(transactionLimits.daily - transactionLimits.todaySpent).toLocaleString()}`);
      return false;
    }
    
    return true;
  };
  
  // Withdrawal handler
  const handleWithdraw = async () => {
    if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawData.amount) > walletData.availableFunds) {
      toast.error('Insufficient funds');
      return;
    }
    
    if (!checkTransactionLimit(parseFloat(withdrawData.amount))) {
      return;
    }
    
    // Require security verification for withdrawals
    requireSecurity('withdraw', withdrawData);
  };
  
  const executeWithdraw = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/wallet/withdraw', {
        ...data,
        amount: parseFloat(data.amount),
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Emit real-time update
      if (socket && connected) {
        socket.emit('wallet_action', {
          type: 'withdraw',
          amount: parseFloat(data.amount),
          userId: user?._id
        });
      }

      toast.success(`Withdrawal of KES ${data.amount} initiated successfully!`);
      setIsWithdrawOpen(false);
      setWithdrawData({ amount: '', method: 'bank', bankAccount: '', description: '' });
      await fetchWalletData();
      await fetchTransactionLimits();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed. Please try again.');
    }
  };

  // Deposit handler
  const handleDeposit = async () => {
    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.post('/wallet/deposit', {
        ...depositData,
        amount: parseFloat(depositData.amount),
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Deposit of KES ${depositData.amount} recorded successfully!`);
      setIsDepositOpen(false);
      setDepositData({ amount: '', method: 'mpesa', reference: '', description: '' });
      await fetchWalletData();
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Deposit failed. Please try again.');
    }
  };

  // Investment handler with security
  const handleInvest = async () => {
    if (!investData.amount || parseFloat(investData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(investData.amount) > walletData.availableFunds) {
      toast.error('Insufficient funds for investment');
      return;
    }
    
    // Require security verification for investments
    requireSecurity('invest', investData);
  };
  
  const executeInvest = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const expectedReturn = calculateExpectedReturn(parseFloat(data.amount), data.plan, parseInt(data.duration));
      
      const response = await api.post('/wallet/invest', {
        ...data,
        amount: parseFloat(data.amount),
        expectedReturn,
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Emit real-time update
      if (socket && connected) {
        socket.emit('wallet_action', {
          type: 'invest',
          amount: parseFloat(data.amount),
          plan: data.plan,
          userId: user?._id
        });
      }

      toast.success(`Investment of KES ${data.amount} created successfully!`);
      setIsInvestOpen(false);
      setInvestData({ amount: '', plan: 'fixed', duration: '12', expectedReturn: '' });
      await fetchWalletData();
    } catch (error) {
      console.error('Investment error:', error);
      toast.error('Investment failed. Please try again.');
    }
  };

  // Transfer handler with security
  const handleTransfer = async () => {
    if (!transferData.amount || parseFloat(transferData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(transferData.amount) > walletData.availableFunds) {
      toast.error('Insufficient funds');
      return;
    }

    if (!transferData.recipient || !transferData.accountNumber) {
      toast.error('Please provide recipient details');
      return;
    }
    
    if (!checkTransactionLimit(parseFloat(transferData.amount))) {
      return;
    }
    
    // Require security verification for transfers
    requireSecurity('transfer', transferData);
  };
  
  const executeTransfer = async (data) => {
    try{
      const token = localStorage.getItem('token');
      const response = await api.post('/wallet/transfer', {
        ...data,
        amount: parseFloat(data.amount),
        userId: user?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Emit real-time update
      if (socket && connected) {
        socket.emit('wallet_action', {
          type: 'transfer',
          amount: parseFloat(data.amount),
          recipient: data.recipient,
          userId: user?._id
        });
      }

      toast.success(`Transfer of KES ${data.amount} to ${data.recipient} successful!`);
      setIsTransferOpen(false);
      setTransferData({ amount: '', recipient: '', accountNumber: '', description: '' });
      await fetchWalletData();
      await fetchTransactionLimits();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed. Please try again.');
    }
  };

  // Calculate expected return for investments
  const calculateExpectedReturn = (amount, plan, duration) => {
    const rates = {
      fixed: 0.08, // 8% annual
      flexible: 0.06, // 6% annual
      premium: 0.12, // 12% annual
      compound: 0.10 // 10% annual
    };
    
    const rate = rates[plan] || 0.08;
    const years = duration / 12;
    
    if (plan === 'compound') {
      return amount * Math.pow(1 + rate, years);
    }
    return amount * (1 + (rate * years));
  };

  const getTransactionIcon = (type, category) => {
    if (type === 'income') return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    if (type === 'expense') return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    return <RefreshCw className="h-4 w-4 text-blue-600" />;
  };
  
  const getProviderIcon = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'mpesa':
        return '📱';
      case 'paypal':
        return '💙';
      case 'bank':
        return '🏦';
      case 'card':
        return '💳';
      case 'stripe':
        return '💜';
      case 'flutterwave':
        return '🟠';
      case 'airtel':
        return '🔴';
      case 'tkash':
        return '📲';
      case 'paystack':
        return '🔵';
      case 'pesapal':
        return '🟢';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(trans => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'income') return trans.type === 'income';
    if (activeFilter === 'expense') return trans.type === 'expense';
    if (activeFilter === 'pending') return trans.type === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading wallet data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <WalletIcon className="h-8 w-8 text-primary" />
            My Wallet
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your financial transactions and manage your funds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsWalletSettingsOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Deposit */}
        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-green-500">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Deposit</h3>
                <p className="text-xs text-muted-foreground mt-1">Add funds</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>Add money to your wallet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount">Amount (KES) *</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deposit-method">Payment Method *</Label>
                <Select value={depositData.method} onValueChange={(value) => setDepositData({ ...depositData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deposit-reference">Reference Number</Label>
                <Input
                  id="deposit-reference"
                  placeholder="Transaction reference"
                  value={depositData.reference}
                  onChange={(e) => setDepositData({ ...depositData, reference: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deposit-description">Description (Optional)</Label>
                <Textarea
                  id="deposit-description"
                  placeholder="Add notes"
                  value={depositData.description}
                  onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
              <Button onClick={handleDeposit}>Confirm Deposit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw */}
        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-red-500">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <Minus className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Withdraw</h3>
                <p className="text-xs text-muted-foreground mt-1">Cash out</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Available: KES {walletData.availableFunds.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount">Amount (KES) *</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="withdraw-method">Withdrawal Method *</Label>
                <Select value={withdrawData.method} onValueChange={(value) => setWithdrawData({ ...withdrawData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="withdraw-account">Bank Account / Phone Number *</Label>
                <Input
                  id="withdraw-account"
                  placeholder="Account details"
                  value={withdrawData.bankAccount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, bankAccount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="withdraw-description">Description (Optional)</Label>
                <Textarea
                  id="withdraw-description"
                  placeholder="Add notes"
                  value={withdrawData.description}
                  onChange={(e) => setWithdrawData({ ...withdrawData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
              <Button onClick={handleWithdraw} variant="destructive">Confirm Withdrawal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer */}
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-500">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Transfer</h3>
                <p className="text-xs text-muted-foreground mt-1">Send money</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
              <DialogDescription>
                Send money to another account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transfer-amount">Amount (KES) *</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transfer-recipient">Recipient Name *</Label>
                <Input
                  id="transfer-recipient"
                  placeholder="Full name"
                  value={transferData.recipient}
                  onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transfer-account">Account Number *</Label>
                <Input
                  id="transfer-account"
                  placeholder="Account or phone number"
                  value={transferData.accountNumber}
                  onChange={(e) => setTransferData({ ...transferData, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transfer-description">Description (Optional)</Label>
                <Textarea
                  id="transfer-description"
                  placeholder="Add notes"
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
              <Button onClick={handleTransfer}>Send Transfer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invest */}
        <Dialog open={isInvestOpen} onOpenChange={setIsInvestOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow hover:border-purple-500">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <ChartLine className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Invest</h3>
                <p className="text-xs text-muted-foreground mt-1">Grow wealth</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Investment</DialogTitle>
              <DialogDescription>
                Invest your funds and earn returns
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invest-amount">Amount (KES) *</Label>
                <Input
                  id="invest-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investData.amount}
                  onChange={(e) => setInvestData({ ...investData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="invest-plan">Investment Plan *</Label>
                <Select value={investData.plan} onValueChange={(value) => setInvestData({ ...investData, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Deposit (8% p.a.)</SelectItem>
                    <SelectItem value="flexible">Flexible Savings (6% p.a.)</SelectItem>
                    <SelectItem value="premium">Premium Growth (12% p.a.)</SelectItem>
                    <SelectItem value="compound">Compound Interest (10% p.a.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invest-duration">Duration (Months) *</Label>
                <Select value={investData.duration} onValueChange={(value) => setInvestData({ ...investData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                    <SelectItem value="36">36 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {investData.amount && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Expected Return:</p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {calculateExpectedReturn(parseFloat(investData.amount) || 0, investData.plan, parseInt(investData.duration)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profit: KES {(calculateExpectedReturn(parseFloat(investData.amount) || 0, investData.plan, parseInt(investData.duration)) - (parseFloat(investData.amount) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInvestOpen(false)}>Cancel</Button>
              <Button onClick={handleInvest}>Start Investment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security PIN Verification Dialog */}
      <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Verification Required
            </DialogTitle>
            <DialogDescription>
              Enter your 4-digit security PIN to continue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="security-pin">Security PIN *</Label>
              <Input
                id="security-pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            {pendingAction && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Pending Action:</p>
                <p className="text-lg font-bold capitalize">{pendingAction.action}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: KES {parseFloat(pendingAction.data?.amount || 0).toLocaleString()}
                </p>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p>🔒 Your PIN is encrypted and secure</p>
              <p>💡 Forgot PIN? Contact support</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSecurityOpen(false);
              setSecurityPin('');
              setPendingAction(null);
            }}>Cancel</Button>
            <Button onClick={verifySecurityPin} disabled={securityPin.length < 4}>
              <Lock className="mr-2 h-4 w-4" />
              Verify & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Settings Dialog */}
      <Dialog open={isWalletSettingsOpen} onOpenChange={setIsWalletSettingsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Wallet Settings
            </DialogTitle>
            <DialogDescription>
              Manage your wallet preferences and security settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Notifications Section */}
            <div>
              <h3 className="font-semibold mb-3">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tx-notif">Transaction Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get notified for all transactions</p>
                  </div>
                  <input
                    type="checkbox"
                    id="tx-notif"
                    checked={walletSettings.transactionNotifications}
                    onChange={(e) => setWalletSettings({ ...walletSettings, transactionNotifications: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive transaction alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notif"
                    checked={walletSettings.emailNotifications}
                    onChange={(e) => setWalletSettings({ ...walletSettings, emailNotifications: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get SMS alerts for transactions</p>
                  </div>
                  <input
                    type="checkbox"
                    id="sms-notif"
                    checked={walletSettings.smsNotifications}
                    onChange={(e) => setWalletSettings({ ...walletSettings, smsNotifications: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Security</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Extra security for your wallet</p>
                  </div>
                  <input
                    type="checkbox"
                    id="2fa"
                    checked={walletSettings.twoFactorAuth}
                    onChange={(e) => setWalletSettings({ ...walletSettings, twoFactorAuth: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto-Save Receipts</Label>
                    <p className="text-xs text-muted-foreground">Automatically save transaction receipts</p>
                  </div>
                  <input
                    type="checkbox"
                    id="auto-save"
                    checked={walletSettings.autoSaveReceipts}
                    onChange={(e) => setWalletSettings({ ...walletSettings, autoSaveReceipts: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Preferences</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={walletSettings.currency} onValueChange={(value) => setWalletSettings({ ...walletSettings, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">🇰🇪 KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                      <SelectItem value="UGX">🇺🇬 UGX - Ugandan Shilling</SelectItem>
                      <SelectItem value="TZS">🇹🇿 TZS - Tanzanian Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={walletSettings.language} onValueChange={(value) => setWalletSettings({ ...walletSettings, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={walletSettings.theme} onValueChange={(value) => setWalletSettings({ ...walletSettings, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Transaction Limits Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Transaction Limits</h3>
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Limit:</span>
                  <span className="font-medium">KES {transactionLimits.daily.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Transaction:</span>
                  <span className="font-medium">KES {transactionLimits.perTransaction.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Contact support to increase limits
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSettings}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Payment Account Dialog */}
      <Dialog open={isLinkAccountOpen} onOpenChange={setIsLinkAccountOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Link Payment Account
            </DialogTitle>
            <DialogDescription>
              Connect your external payment accounts for seamless transfers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="provider">Payment Provider *</Label>
              <Select value={linkAccountData.provider} onValueChange={(value) => setLinkAccountData({ ...linkAccountData, provider: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">📱 M-Pesa (Safaricom)</SelectItem>
                  <SelectItem value="airtel">🔴 Airtel Money</SelectItem>
                  <SelectItem value="tkash">📲 T-Kash (Telkom)</SelectItem>
                  <SelectItem value="paypal">💙 PayPal</SelectItem>
                  <SelectItem value="stripe">💜 Stripe</SelectItem>
                  <SelectItem value="flutterwave">🟠 Flutterwave</SelectItem>
                  <SelectItem value="paystack">🔵 Paystack</SelectItem>
                  <SelectItem value="pesapal">🟢 PesaPal</SelectItem>
                  <SelectItem value="bank">🏦 Bank Account</SelectItem>
                  <SelectItem value="card">💳 Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {linkAccountData.provider === 'mpesa' && (
              <>
                <div>
                  <Label htmlFor="mpesa-phone">M-Pesa Phone Number *</Label>
                  <Input
                    id="mpesa-phone"
                    placeholder="+254 700 000 000"
                    value={linkAccountData.phoneNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mpesa-name">Account Name *</Label>
                  <Input
                    id="mpesa-name"
                    placeholder="Full name as registered"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'paypal' && (
              <>
                <div>
                  <Label htmlFor="paypal-email">PayPal Email *</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkAccountData.email}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paypal-name">Account Name *</Label>
                  <Input
                    id="paypal-name"
                    placeholder="Full name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'airtel' && (
              <>
                <div>
                  <Label htmlFor="airtel-phone">Airtel Money Phone Number *</Label>
                  <Input
                    id="airtel-phone"
                    placeholder="+254 700 000 000"
                    value={linkAccountData.phoneNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="airtel-name">Account Name *</Label>
                  <Input
                    id="airtel-name"
                    placeholder="Full name as registered"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'tkash' && (
              <>
                <div>
                  <Label htmlFor="tkash-phone">T-Kash Phone Number *</Label>
                  <Input
                    id="tkash-phone"
                    placeholder="+254 700 000 000"
                    value={linkAccountData.phoneNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tkash-name">Account Name *</Label>
                  <Input
                    id="tkash-name"
                    placeholder="Full name as registered"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'stripe' && (
              <>
                <div>
                  <Label htmlFor="stripe-email">Stripe Email *</Label>
                  <Input
                    id="stripe-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkAccountData.email}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-account">Stripe Account ID (Optional)</Label>
                  <Input
                    id="stripe-account"
                    placeholder="acct_xxxxxxxxxxxx"
                    value={linkAccountData.accountNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-name">Account Name *</Label>
                  <Input
                    id="stripe-name"
                    placeholder="Full name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'flutterwave' && (
              <>
                <div>
                  <Label htmlFor="flutterwave-email">Flutterwave Email *</Label>
                  <Input
                    id="flutterwave-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkAccountData.email}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="flutterwave-phone">Phone Number *</Label>
                  <Input
                    id="flutterwave-phone"
                    placeholder="+254 700 000 000"
                    value={linkAccountData.phoneNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="flutterwave-name">Account Name *</Label>
                  <Input
                    id="flutterwave-name"
                    placeholder="Full name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'paystack' && (
              <>
                <div>
                  <Label htmlFor="paystack-email">Paystack Email *</Label>
                  <Input
                    id="paystack-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkAccountData.email}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paystack-name">Account Name *</Label>
                  <Input
                    id="paystack-name"
                    placeholder="Full name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'pesapal' && (
              <>
                <div>
                  <Label htmlFor="pesapal-email">PesaPal Email *</Label>
                  <Input
                    id="pesapal-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkAccountData.email}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pesapal-phone">Phone Number *</Label>
                  <Input
                    id="pesapal-phone"
                    placeholder="+254 700 000 000"
                    value={linkAccountData.phoneNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pesapal-name">Account Name *</Label>
                  <Input
                    id="pesapal-name"
                    placeholder="Full name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'bank' && (
              <>
                <div>
                  <Label htmlFor="bank-name">Bank Name *</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., Equity Bank"
                    value={linkAccountData.accountType}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountType: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-account">Account Number *</Label>
                  <Input
                    id="bank-account"
                    placeholder="Account number"
                    value={linkAccountData.accountNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-account-name">Account Name *</Label>
                  <Input
                    id="bank-account-name"
                    placeholder="Account holder name"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            {linkAccountData.provider === 'card' && (
              <>
                <div>
                  <Label htmlFor="card-number">Card Number *</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={linkAccountData.accountNumber}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Expiry Date *</Label>
                    <Input id="card-expiry" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div>
                    <Label htmlFor="card-cvv">CVV *</Label>
                    <Input id="card-cvv" type="password" placeholder="123" maxLength={3} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="card-name">Card Holder Name *</Label>
                  <Input
                    id="card-name"
                    placeholder="Name on card"
                    value={linkAccountData.accountName}
                    onChange={(e) => setLinkAccountData({ ...linkAccountData, accountName: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">🔒 Secure Connection</p>
              <p className="text-xs">Your payment information is encrypted and secure. We never store sensitive data.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkAccountOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkAccount}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* External Transfer Dialog */}
      <Dialog open={isExternalTransferOpen} onOpenChange={setIsExternalTransferOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              External Transfer
            </DialogTitle>
            <DialogDescription>
              Transfer funds to your connected payment accounts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="transfer-account">Destination Account *</Label>
              <Select 
                value={externalTransferData.accountId} 
                onValueChange={(value) => {
                  const account = connectedAccounts.find(acc => acc._id === value);
                  setExternalTransferData({ 
                    ...externalTransferData, 
                    accountId: value,
                    provider: account?.provider || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connected account" />
                </SelectTrigger>
                <SelectContent>
                  {connectedAccounts.map(account => (
                    <SelectItem key={account._id} value={account._id}>
                      {getProviderIcon(account.provider)} {account.provider.toUpperCase()} - {account.accountName || account.phoneNumber || account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {connectedAccounts.length === 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No connected accounts found. Please link an account first.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setIsExternalTransferOpen(false);
                    setIsLinkAccountOpen(true);
                  }}
                >
                  Link Account
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="external-amount">Amount (KES) *</Label>
              <Input
                id="external-amount"
                type="number"
                placeholder="Enter amount"
                value={externalTransferData.amount}
                onChange={(e) => setExternalTransferData({ ...externalTransferData, amount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: KES {walletData.availableFunds.toLocaleString()}
              </p>
            </div>

            <div>
              <Label htmlFor="external-description">Description (Optional)</Label>
              <Textarea
                id="external-description"
                placeholder="Add notes about this transfer"
                value={externalTransferData.description}
                onChange={(e) => setExternalTransferData({ ...externalTransferData, description: e.target.value })}
              />
            </div>

            {externalTransferData.provider && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Transfer Summary:</p>
                <div className="space-y-1 text-sm">
                  <p>Provider: {externalTransferData.provider.toUpperCase()}</p>
                  <p>Amount: KES {parseFloat(externalTransferData.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">Processing time: 1-24 hours</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExternalTransferOpen(false)}>Cancel</Button>
            <Button onClick={handleExternalTransfer} disabled={connectedAccounts.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Send Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connected Accounts Section */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>Manage your linked payment accounts</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsLinkAccountOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Link Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedAccounts.map(account => (
                <div key={account._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getProviderIcon(account.provider)}</div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {account.provider.toUpperCase()}
                        {account.verified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.accountName || account.phoneNumber || account.email || account.accountNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Linked {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setExternalTransferData({ 
                          ...externalTransferData, 
                          accountId: account._id,
                          provider: account.provider
                        });
                        setIsExternalTransferOpen(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Transfer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDisconnectAccount(account._id)}
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Link Account Button */}
      {connectedAccounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Connect Payment Accounts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Link your M-Pesa, PayPal, or Bank accounts for quick transfers
            </p>
            <Button onClick={() => setIsLinkAccountOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Link Your First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transaction Limits Info Card */}
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Transaction Limits & Security
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Daily Limit: KES {transactionLimits.daily.toLocaleString()}</p>
                <p>Per Transaction: KES {transactionLimits.perTransaction.toLocaleString()}</p>
                <p>Today's Spending: KES {transactionLimits.todaySpent.toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  Remaining: KES {(transactionLimits.daily - transactionLimits.todaySpent).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {connected ? '🟢 Live' : '🔴 Offline'}
            </Badge>
          </div>
          <Progress 
            value={(transactionLimits.todaySpent / transactionLimits.daily) * 100} 
            className="mt-3 h-2"
          />
        </CardContent>
      </Card>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {showBalance ? `KES ${walletData.balance.toLocaleString()}` : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Available funds: KES {walletData.availableFunds.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              KES {walletData.totalIncome.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              From sales & payments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              KES {walletData.totalExpenses.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Payments & refunds
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-600" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              KES {walletData.pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Breakdown */}
      {currencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currency Breakdown</CardTitle>
            <CardDescription>Your balance across different currencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currencies.map(currency => (
                <div key={currency.code} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{currency.code}</span>
                    <Badge variant="outline">{currency.code}</Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {currency.balance.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-green-600">↓ {currency.income.toLocaleString()}</span>
                    <span className="text-red-600">↑ {currency.expenses.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>View all your financial activities</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('income')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Income
              </Button>
              <Button
                variant={activeFilter === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('expense')}
              >
                <Minus className="h-3 w-3 mr-1" />
                Expenses
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' :
                        transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {getTransactionIcon(transaction.type, transaction.category)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{transaction.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date.toLocaleDateString()} {transaction.date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
