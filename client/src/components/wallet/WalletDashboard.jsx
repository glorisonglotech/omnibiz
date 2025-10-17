import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Shield,
  Smartphone,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

export default function WalletDashboard({ onBalanceUpdate }) {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stkAmount, setStkAmount] = useState('');
  const [stkProcessing, setStkProcessing] = useState(false);

  // Fetch wallet
  useEffect(() => {
    fetchWallet();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('wallet_updated', (data) => {
      setWallet(prev => prev ? { ...prev, balance: data.balance } : null);
      toast.success(`Wallet ${data.type}: ${data.transaction?.description}`);
      if (onBalanceUpdate) onBalanceUpdate(data.balance);
    });

    socket.on('payment_success', (data) => {
      setWallet(prev => prev ? { ...prev, balance: data.balance } : null);
      setStkProcessing(false);
      toast.success(`Payment successful! Receipt: ${data.receipt}`);
      if (onBalanceUpdate) onBalanceUpdate(data.balance);
    });

    socket.on('payment_failed', (data) => {
      setStkProcessing(false);
      toast.error(`Payment failed: ${data.reason}`);
    });

    socket.on('mpesa_initiated', (data) => {
      toast.info(data.message || 'Check your phone for M-Pesa prompt', { duration: 10000 });
    });

    return () => {
      socket.off('wallet_updated');
      socket.off('payment_success');
      socket.off('payment_failed');
      socket.off('mpesa_initiated');
    };
  }, [socket, connected, onBalanceUpdate]);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet');
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSTKPush = async () => {
    if (!stkAmount || stkAmount <= 0) {
      return toast.error('Please enter a valid amount');
    }

    try {
      setStkProcessing(true);
      const response = await api.post('/mpesa/stk-push', {
        phone: '',  // Uses user's phone
        amount: Number(stkAmount),
        accountReference: 'WALLET_TOPUP',
        transactionDesc: 'Wallet top-up via M-Pesa'
      });

      toast.success(response.data.message);
      setStkAmount('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment');
      setStkProcessing(false);
    }
  };

  const handleDeposit = async (amount, source = 'manual') => {
    try {
      const response = await api.post('/wallet/deposit', {
        amount: Number(amount),
        source,
        description: `Wallet deposit from ${source}`
      });

      toast.success(response.data.message);
      setWallet(response.data.wallet);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deposit');
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-40 bg-muted rounded-lg"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {/* Wallet Balance Card */}
      <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Digital Wallet
            {connected && (
              <Badge variant="success" className="gap-1 ml-auto">
                <Zap className="h-3 w-3" />
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Balance */}
            <div>
              <div className="text-sm text-muted-foreground">Available Balance</div>
              <div className="text-2xl font-bold text-green-600">
                {wallet?.currency || 'KES'} {wallet?.balance?.toLocaleString() || '0.00'}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Shield className="h-3 w-3" />
                Secure
              </div>
            </div>

            {/* Daily Limit */}
            <div>
              <div className="text-sm text-muted-foreground">Daily Limit</div>
              <div className="text-lg font-semibold">
                {wallet?.currency || 'KES'} {wallet?.dailyLimit?.toLocaleString() || '100,000'}
              </div>
              <div className="text-xs text-muted-foreground">
                Used: {wallet?.todaySpent?.toLocaleString() || '0'}
              </div>
            </div>

            {/* Total Transactions */}
            <div>
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-lg font-semibold">{wallet?.totalTransactions || 0}</div>
              <div className="text-xs text-muted-foreground">All time</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Amount ({wallet?.currency || 'KES'})</Label>
                    <Input type="number" placeholder="0.00" id="deposit-amount" />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      const amount = document.getElementById('deposit-amount').value;
                      if (amount) handleDeposit(amount);
                    }}
                  >
                    Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" variant="outline" className="gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Withdraw
            </Button>

            <Button size="sm" variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* M-Pesa STK Push */}
      <Card className="border-2 border-green-600/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-Pesa Quick Top-Up
          </CardTitle>
          <CardDescription>
            Top up using your registered phone: {user?.phone || 'Not set'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount (KES)"
              value={stkAmount}
              onChange={(e) => setStkAmount(e.target.value)}
              disabled={stkProcessing}
              className="flex-1"
            />
            <Button 
              onClick={handleSTKPush}
              disabled={stkProcessing || !stkAmount}
              className="gap-2"
            >
              {stkProcessing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4" />
                  Pay
                </>
              )}
            </Button>
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded text-xs space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Uses your registered phone number
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Instant wallet credit on payment
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Real-time payment notifications
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
