import { useState, useEffect } from "react";
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
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useFinancial } from "@/context/FinancialContext";
import PaymentOptions from "@/components/payments/PaymentOptions";
import MpesaPayment from "@/components/payments/MpesaPayment";
import PayPalPayment from "@/components/payments/PayPalPayment";

const Finances = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const {
    summary: financialSummaryData,
    transactions: recentTransactions,
    loading: financialLoading,
    refreshFinancialData
  } = useFinancial();

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
    const fetchInvoices = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Fetch invoices (financial summary and transactions are handled by FinancialContext)
        const invoicesResponse = await api.get("/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = extractInvoices(invoicesResponse.data).map(
          normalizeInvoice
        );
        setInvoices(list);
      } catch (error) {
        toast.error("Error fetching invoices.");
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices(); // Run the function when the component mounts or when `isAuthenticated` changes
  }, [isAuthenticated]);

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
            Track income, expenses, and manage invoices
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
            <p className="text-xs text-muted-foreground">
              +12% from last month
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
            <p className="text-xs text-muted-foreground">+5% from last month</p>
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
            <p className="text-xs text-muted-foreground">
              +18% from last month
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
            <p className="text-xs text-muted-foreground">5 invoices pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Integration Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Integration Demo
          </CardTitle>
          <CardDescription>
            Test the integrated M-Pesa and PayPal payment systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Sample Payment - KES 1,000</h3>
              <p className="text-sm text-muted-foreground">
                Test M-Pesa payment integration with a sample amount
              </p>
              <MpesaPayment
                amount={1000}
                description="Test payment for OmniBiz services"
                onSuccess={(data) => {
                  toast.success("M-Pesa payment successful!");
                  console.log("Payment data:", data);
                }}
                onError={(error) => {
                  toast.error("M-Pesa payment failed");
                  console.error("Payment error:", error);
                }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Sample Payment - $10 USD</h3>
              <p className="text-sm text-muted-foreground">
                Test PayPal payment integration with a sample amount
              </p>
              <PayPalPayment
                amount={10}
                description="Test payment for OmniBiz services"
                currency="USD"
                onSuccess={(data) => {
                  toast.success("PayPal payment successful!");
                  console.log("Payment data:", data);
                }}
                onError={(error) => {
                  toast.error("PayPal payment failed");
                  console.error("Payment error:", error);
                }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Combined Payment Options</h3>
              <p className="text-sm text-muted-foreground">
                Show both payment methods in a single dialog
              </p>
              <PaymentOptions
                amount={2500}
                description="Premium service subscription"
                currency="KES"
                triggerText="Pay KES 2,500"
                onSuccess={(data) => {
                  toast.success("Payment completed successfully!");
                  console.log("Payment data:", data);
                }}
                onError={(error) => {
                  toast.error("Payment failed");
                  console.error("Payment error:", error);
                }}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Integration Status</p>
                <p className="text-xs text-muted-foreground">
                  Payment integrations are configured for sandbox/testing.
                  To process real payments, update the environment variables with production credentials.
                </p>
              </div>
            </div>
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
    </div>
  );
};

export default Finances;
