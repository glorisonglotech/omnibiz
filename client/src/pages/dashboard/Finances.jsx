import { useState, useEffect } from "react";
import ComprehensiveGraphs from "@/components/ComprehensiveGraphs";
import { useSocket } from "@/context/SocketContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  Download,
  Search,
  FileText,
  Receipt,
  Users,
  Send,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useFinancial } from "@/context/FinancialContext";
import PaymentOptions from "@/components/payments/PaymentOptions";
import MpesaPayment from "@/components/payments/MpesaPayment";
import PayPalPayment from "@/components/payments/PayPalPayment";
import WalletDashboard from "@/components/wallet/WalletDashboard";
import EmployeePayment from "@/components/payments/EmployeePayment";

const Finances = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const {
    summary: financialSummaryData,
    transactions: recentTransactions,
    loading: financialLoading,
    refreshFinancialData
  } = useFinancial();
  const { socket, connected } = useSocket();

  // Provide fallback values if data is null
  const financialSummary = financialSummaryData || {
    totalRevenue: "KES 0",
    totalExpenses: "KES 0",
    netProfit: "KES 0",
    pendingInvoices: "KES 0",
  };

  // Ensure transactions is always an array
  const safeTransactions = recentTransactions || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    pendingCount: 0
  });
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    dueDate: "",
    description: "",
  });
  // Put these near the top:
  const extractInvoices = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.invoices || payload?.items || payload?.data || [];
  };

  const normalizeInvoice = (inv) => ({
    id: inv._id || inv.id,
    customerName:
      inv.customerName ?? inv.clientName ?? inv.customer?.name ?? "",
    totalAmount: Number(inv.totalAmount ?? inv.amount ?? 0),
    paymentStatus: inv.paymentStatus ?? inv.status ?? "pending",
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all financial data in parallel
        const [invoicesRes, expensesRes, ordersRes] = await Promise.all([
          api.get("/invoices", { headers }).catch(() => ({ data: [] })),
          api.get("/expenses", { headers }).catch(() => ({ data: [] })),
          api.get("/orders", { headers }).catch(() => ({ data: [] }))
        ]);

        const invoicesList = extractInvoices(invoicesRes.data).map(normalizeInvoice);
        const expensesList = expensesRes.data || [];
        const ordersList = ordersRes.data || [];
        
        setInvoices(invoicesList);
        setExpenses(expensesList);
        setOrders(ordersList);
        
        // Calculate growth metrics
        calculateGrowthMetrics(invoicesList, expensesList, ordersList);
        
        console.log('✅ Financial data loaded:', {
          invoices: invoicesList.length,
          expenses: expensesList.length,
          orders: ordersList.length
        });
      } catch (error) {
        toast.error("Error fetching financial data.");
        console.error("Error fetching financial data:", error);
      }
    };

    fetchFinancialData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchFinancialData, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  // Generate revenue vs expenses data for graphs
  const generateRevenueExpenseData = (ordersList, expensesList) => {
    const monthlyData = {};
    const months = [];
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push(monthKey);
      monthlyData[monthKey] = { name: monthName, revenue: 0, expenses: 0, profit: 0 };
    }
    
    // Aggregate orders by month
    ordersList.forEach(order => {
      const date = new Date(order.createdAt || order.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += Number(order.total) || 0;
      }
    });
    
    // Aggregate expenses by month
    expensesList.forEach(expense => {
      const date = new Date(expense.createdAt || expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].expenses += Number(expense.amount) || 0;
      }
    });
    
    // Calculate profit
    Object.values(monthlyData).forEach(month => {
      month.profit = month.revenue - month.expenses;
    });
    
    return Object.values(monthlyData);
  };
  
  // Generate daily cash flow data
  const generateCashFlowData = (ordersList, expensesList) => {
    const last30Days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = ordersList.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        return orderDate.toISOString().split('T')[0] === dateStr;
      });
      
      const dayExpenses = expensesList.filter(expense => {
        const expenseDate = new Date(expense.createdAt || expense.date);
        return expenseDate.toISOString().split('T')[0] === dateStr;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      const dayExpense = dayExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
      
      last30Days.push({
        date: dateStr,
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayRevenue - dayExpense,
        revenue: dayRevenue,
        expenses: dayExpense
      });
    }
    
    return last30Days;
  };

  // Calculate growth metrics from real data
  const calculateGrowthMetrics = (invoicesList, expensesList, ordersList) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Revenue from orders (current vs last month)
    const lastMonthRevenue = ordersList
      .filter(o => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < currentMonth)
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    const currentMonthRevenue = ordersList
      .filter(o => new Date(o.createdAt) >= currentMonth)
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    const revenueGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;
    
    // Expenses (current vs last month)
    const lastMonthExpenses = expensesList
      .filter(e => new Date(e.createdAt) >= lastMonth && new Date(e.createdAt) < currentMonth)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const currentMonthExpenses = expensesList
      .filter(e => new Date(e.createdAt) >= currentMonth)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const expenseGrowth = lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1)
      : 0;
    
    // Profit growth
    const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
    const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
    const profitGrowth = lastMonthProfit > 0
      ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit * 100).toFixed(1)
      : 0;
    
    // Pending invoices count
    const pendingCount = invoicesList.filter(inv => 
      inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid'
    ).length;
    
    setCalculatedMetrics({
      revenueGrowth: Number(revenueGrowth),
      expenseGrowth: Number(expenseGrowth),
      profitGrowth: Number(profitGrowth),
      pendingCount
    });
  };

  // Add Expense Handler
  const handleExpenseSubmit = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage

      // Send data to the backend for adding the expense
      const response = await api.post(
        "/expenses",
        {
          description: "New expense",
          amount: 1000,
          category: "office",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token
          },
        }
      );

      toast.success("Expense added successfully!");
      setIsExpenseDialogOpen(false);
      // Fetch updated data if needed
    } catch (error) {
      toast.error("Error adding expense.");
      console.error("Error adding expense:", error);
    }
  };

  const handleInvoiceSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    const { clientName, clientEmail, amount, dueDate, description } =
      newInvoice;

    if (!clientName || !clientEmail || !amount || !dueDate) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      const response = await api.post(
        "/invoices",
        {
          customerName: clientName,
          clientEmail,
          totalAmount: Number(amount),
          dueDate,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Invoice created successfully!");
      setIsInvoiceDialogOpen(false);
      setNewInvoice({
        clientName: "",
        clientEmail: "",
        amount: "",
        dueDate: "",
        description: "",
      });
      const created = normalizeInvoice(response.data);
      setInvoices((prev) => [created, ...prev]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Error creating invoice.");
      console.error("Error creating invoice:", error);
    }
  };

  if (loading || financialLoading) {
    return <div>Loading...</div>; // Show loading state while checking authentication or loading financial data
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage financial data.</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Financial Management
          </h1>
          <p className="text-muted-foreground">
            Track wallet, payments, income, expenses, and manage invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isExpenseDialogOpen}
            onOpenChange={setIsExpenseDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Receipt className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expense-description">Description</Label>
                  <Input
                    id="expense-description"
                    placeholder="Enter expense description"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Amount (KES)</Label>
                  <Input id="expense-amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="expense-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-notes">Notes</Label>
                  <Textarea
                    id="expense-notes"
                    placeholder="Additional notes (optional)"
                  />
                </div>
                <Button className="w-full" onClick={handleExpenseSubmit}>
                  Record Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isInvoiceDialogOpen}
            onOpenChange={setIsInvoiceDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    placeholder="Enter client name"
                    value={newInvoice.clientName}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        clientName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="client@example.com"
                    value={newInvoice.clientEmail}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        clientEmail: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="invoice-amount">Amount (KES)</Label>
                  <Input
                    id="invoice-amount"
                    type="number"
                    placeholder="0.00"
                    value={newInvoice.amount}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, amount: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="invoice-description">Description</Label>
                  <Textarea
                    id="invoice-description"
                    placeholder="Invoice description or items"
                    value={newInvoice.description}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <Button className="w-full" onClick={handleInvoiceSubmit}>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Wallet Dashboard - New Enhanced Section */}
      <WalletDashboard onBalanceUpdate={refreshFinancialData} />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {financialSummary.totalRevenue}
            </div>
            <p className={`text-xs ${calculatedMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculatedMetrics.revenueGrowth >= 0 ? '+' : ''}{calculatedMetrics.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {financialSummary.totalExpenses}
            </div>
            <p className={`text-xs ${calculatedMetrics.expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {calculatedMetrics.expenseGrowth >= 0 ? '+' : ''}{calculatedMetrics.expenseGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {financialSummary.netProfit}
            </div>
            <p className={`text-xs ${calculatedMetrics.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculatedMetrics.profitGrowth >= 0 ? '+' : ''}{calculatedMetrics.profitGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <CreditCard className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {financialSummary.pendingInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculatedMetrics.pendingCount} invoice{calculatedMetrics.pendingCount !== 1 ? 's' : ''} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComprehensiveGraphs
          title="Revenue vs Expenses"
          description="Last 12 months from real orders and expenses"
          type="composed"
          data={generateRevenueExpenseData(orders, expenses)}
          height={350}
          autoRefresh={true}
          refreshInterval={120000}
        />

        <ComprehensiveGraphs
          title="Profit Trends"
          description="Net profit calculated from revenue - expenses"
          type="area"
          data={generateRevenueExpenseData(orders, expenses).map(d => ({
            name: d.name,
            value: d.profit,
            profit: d.profit
          }))}
          height={350}
          autoRefresh={true}
          refreshInterval={120000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComprehensiveGraphs
          title="Expense Categories"
          description="Breakdown of business expenses from real data"
          type="pie"
          data={(() => {
            const categories = {};
            expenses.forEach(exp => {
              const cat = exp.category || 'Other';
              categories[cat] = (categories[cat] || 0) + (Number(exp.amount) || 0);
            });
            return Object.entries(categories).length > 0
              ? Object.entries(categories).map(([name, value]) => ({ name, value }))
              : [
                  { name: 'No expenses yet', value: 1 }
                ];
          })()}
          height={300}
          showControls={false}
        />

        <ComprehensiveGraphs
          title="Cash Flow"
          description="Last 30 days: Revenue - Expenses"
          type="line"
          data={generateCashFlowData(orders, expenses)}
          height={300}
          autoRefresh={true}
          refreshInterval={120000}
        />

        <ComprehensiveGraphs
          title="Invoice Status"
          description="Payment status distribution from real invoices"
          type="bar"
          data={(() => {
            const statusCount = {
              paid: 0,
              pending: 0,
              overdue: 0
            };
            invoices.forEach(inv => {
              const status = inv.paymentStatus?.toLowerCase() || 'pending';
              if (status === 'paid' || status === 'completed') {
                statusCount.paid++;
              } else if (status === 'overdue') {
                statusCount.overdue++;
              } else {
                statusCount.pending++;
              }
            });
            return invoices.length > 0
              ? [
                  { name: 'Paid', value: statusCount.paid },
                  { name: 'Pending', value: statusCount.pending },
                  { name: 'Overdue', value: statusCount.overdue }
                ]
              : [
                  { name: 'No invoices yet', value: 1 }
                ];
          })()}
          height={300}
          showControls={false}
        />
      </div>

      {/* Employee/Worker Payments - Real System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pay Employees & Contractors
          </CardTitle>
          <CardDescription>
            Secure payments to team members via wallet or direct transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Make secure payments to your team members. All transactions are logged and tracked for audit purposes.
            </p>
            <EmployeePayment onSuccess={refreshFinancialData} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(safeTransactions) && safeTransactions.length > 0 ? (
                safeTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.amount}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent transactions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Management
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.id}
                        </TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{`KES ${Number(
                          invoice.totalAmount
                        ).toLocaleString()}`}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(invoice.paymentStatus)}
                          >
                            {invoice.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics Graphs */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <Badge variant="secondary">Live Data</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComprehensiveGraphs
            title="Revenue vs Expenses"
            description="Monthly comparison from real data"
            defaultType="bar"
            data={generateRevenueExpenseData(orders, expenses)}
            height={350}
            autoRefresh={true}
            refreshInterval={120000}
          />
          <ComprehensiveGraphs
            title="Profit Trends"
            description="Net profit over time"
            defaultType="line"
            data={generateRevenueExpenseData(orders, expenses).map(d => ({
              name: d.name,
              value: d.profit
            }))}
            height={350}
            autoRefresh={true}
            refreshInterval={120000}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComprehensiveGraphs
            title="Expense Categories"
            description="Real expense breakdown"
            defaultType="pie"
            data={(() => {
              const categories = {};
              expenses.forEach(exp => {
                const cat = exp.category || 'Other';
                categories[cat] = (categories[cat] || 0) + (Number(exp.amount) || 0);
              });
              return Object.entries(categories).length > 0
                ? Object.entries(categories).map(([name, value]) => ({ name, value }))
                : [{ name: 'No data', value: 1 }];
            })()}
            height={350}
            autoRefresh={false}
            refreshInterval={120000}
          />
          <ComprehensiveGraphs
            title="Cash Flow Analysis"
            description="Daily cash flow from operations"
            defaultType="area"
            data={generateCashFlowData(orders, expenses)}
            height={350}
            autoRefresh={true}
            refreshInterval={120000}
          />
        </div>

        <div className="w-full">
          <ComprehensiveGraphs
            title="Invoice Status Overview"
            description="Invoice payment status distribution"
            defaultType="composed"
            data={(() => {
              const statusCount = { paid: 0, pending: 0, overdue: 0 };
              invoices.forEach(inv => {
                const status = inv.paymentStatus?.toLowerCase() || 'pending';
                if (status === 'paid' || status === 'completed') statusCount.paid++;
                else if (status === 'overdue') statusCount.overdue++;
                else statusCount.pending++;
              });
              return [
                { name: 'Paid', value: statusCount.paid },
                { name: 'Pending', value: statusCount.pending },
                { name: 'Overdue', value: statusCount.overdue }
              ];
            })()}
            height={400}
            autoRefresh={true}
            refreshInterval={120000}
          />
        </div>
      </div>
    </div>
  );
};

export default Finances;
