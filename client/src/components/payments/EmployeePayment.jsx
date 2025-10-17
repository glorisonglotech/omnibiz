import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Send, Wallet as WalletIcon, Smartphone, Shield, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function EmployeePayment({ onSuccess }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [paymentData, setPaymentData] = useState({
    recipientId: '',
    recipientName: '',
    recipientPhone: '',
    amount: '',
    paymentMethod: 'wallet',
    description: '',
    category: 'salary',
    pin: ''
  });

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      fetchWallet();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/team');
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet');
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleRecipientChange = (memberId) => {
    const member = teamMembers.find(m => m._id === memberId);
    if (member) {
      setPaymentData(prev => ({
        ...prev,
        recipientId: member._id,
        recipientName: member.name,
        recipientPhone: member.phone || ''
      }));
    }
  };

  const handlePayment = async () => {
    // Validation
    if (!paymentData.recipientId) {
      return toast.error('Please select a recipient');
    }
    if (!paymentData.amount || paymentData.amount <= 0) {
      return toast.error('Please enter a valid amount');
    }
    if (paymentData.paymentMethod === 'wallet' && !paymentData.pin) {
      return toast.error('Please enter your wallet PIN');
    }

    // Check wallet balance if paying from wallet
    if (paymentData.paymentMethod === 'wallet') {
      if (!wallet || wallet.balance < paymentData.amount) {
        return toast.error('Insufficient wallet balance');
      }
    }

    try {
      setLoading(true);

      let response;
      if (paymentData.paymentMethod === 'wallet') {
        // Pay from wallet - transfer to recipient's wallet
        response = await api.post('/wallet/transfer', {
          amount: Number(paymentData.amount),
          recipientId: paymentData.recipientId,
          description: `${paymentData.category}: ${paymentData.description}`,
          pin: paymentData.pin
        });
      } else {
        // Pay via M-Pesa directly to recipient's phone
        response = await api.post('/mpesa/stk-push', {
          phone: paymentData.recipientPhone,
          amount: Number(paymentData.amount),
          accountReference: `PAY_${paymentData.recipientId}`,
          transactionDesc: `Payment to ${paymentData.recipientName}: ${paymentData.description}`
        });
      }

      // Log the transaction
      await api.post('/transactions', {
        description: `Payment to ${paymentData.recipientName} - ${paymentData.category}`,
        amount: Number(paymentData.amount),
        type: 'expense',
        category: 'employee_payment',
        status: 'completed',
        reference: paymentData.recipientId,
        notes: paymentData.description
      });

      toast.success(`Payment initiated successfully to ${paymentData.recipientName}`);
      setOpen(false);
      
      // Reset form
      setPaymentData({
        recipientId: '',
        recipientName: '',
        recipientPhone: '',
        amount: '',
        paymentMethod: 'wallet',
        description: '',
        category: 'salary',
        pin: ''
      });

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Users className="h-4 w-4" />
          Pay Employee/Contractor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Make Payment to Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All payments are secure, logged, and auditable. Transaction records are maintained for compliance.
            </AlertDescription>
          </Alert>

          {/* Wallet Balance Info */}
          {wallet && paymentData.paymentMethod === 'wallet' && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Balance:</span>
                <span className="text-lg font-semibold text-green-600">
                  {wallet.currency} {wallet.balance?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Recipient Selection */}
          <div>
            <Label>Select Recipient *</Label>
            <Select 
              value={paymentData.recipientId}
              onValueChange={handleRecipientChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No team members found</div>
                ) : (
                  teamMembers.map(member => (
                    <SelectItem key={member._id} value={member._id}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{member.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {member.role || 'Employee'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method *</Label>
            <Select 
              value={paymentData.paymentMethod}
              onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="h-4 w-4" />
                    From Wallet (Instant Transfer)
                  </div>
                </SelectItem>
                <SelectItem value="mpesa">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    M-Pesa Direct (to recipient phone)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount ({wallet?.currency || 'KES'}) *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          {/* Payment Category */}
          <div>
            <Label>Payment Category *</Label>
            <Select 
              value={paymentData.category}
              onValueChange={(value) => setPaymentData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="commission">Commission</SelectItem>
                <SelectItem value="reimbursement">Reimbursement</SelectItem>
                <SelectItem value="allowance">Allowance</SelectItem>
                <SelectItem value="contractor_fee">Contractor Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label>Description/Notes *</Label>
            <Textarea
              placeholder="Payment purpose, period, etc."
              value={paymentData.description}
              onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* PIN for wallet payments */}
          {paymentData.paymentMethod === 'wallet' && (
            <div>
              <Label>Wallet PIN *</Label>
              <Input
                type="password"
                placeholder="Enter your wallet PIN"
                value={paymentData.pin}
                onChange={(e) => setPaymentData(prev => ({ ...prev, pin: e.target.value }))}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for security verification
              </p>
            </div>
          )}

          {/* Recipient Phone Alert for M-Pesa */}
          {paymentData.paymentMethod === 'mpesa' && paymentData.recipientPhone && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                M-Pesa prompt will be sent to: <strong>{paymentData.recipientPhone}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Summary */}
          {paymentData.amount && paymentData.recipientName && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{paymentData.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{wallet?.currency || 'KES'} {Number(paymentData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{paymentData.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
