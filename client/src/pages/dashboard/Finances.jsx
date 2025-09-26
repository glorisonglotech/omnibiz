import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Receipt
} from "lucide-react";
import api from "@/lib/api"; // Import the api instance for API calls
import { toast } from "sonner"; // For notifications

const Finances = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // State to hold dynamic data from the backend
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: "KES 0",
    totalExpenses: "KES 0",
    netProfit: "KES 0",
    pendingInvoices: "KES 0",
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch financial summary data
        const summaryResponse = await api.get("/financial-summary");
        setFinancialSummary(summaryResponse.data);

        // Fetch recent transactions
        const transactionsResponse = await api.get("/transactions");
        setRecentTransactions(transactionsResponse.data);

        // Fetch invoices
        const invoicesResponse = await api.get("/invoices");
        setInvoices(invoicesResponse.data);
      } catch (error) {
        toast.error("Error fetching financial data.");
      }
    };
    fetchData();
  }, []);

  // Add Expense Dialog Handler
  const handleExpenseSubmit = async () => {
    // Here you would send data to the backend for adding the expense
    // For example:
    try {
      const response = await api.post("/expenses", {
        description: "New expense",
        amount: 1000,
        category: "office",
      });
      toast.success("Expense added successfully!");
      setIsExpenseDialogOpen(false);
      // Fetch updated data if needed
    } catch (error) {
      toast.error("Error adding expense.");
    }
  };

  // Create Invoice Dialog Handler
  const handleInvoiceSubmit = async () => {
    // Here you would send data to the backend for creating the invoice
    try {
      const response = await api.post("/invoices", {
        client: "New Client",
        amount: 2000,
        dueDate: "2024-02-15",
        description: "Invoice description",
      });
      toast.success("Invoice created successfully!");
      setIsInvoiceDialogOpen(false);
      // Fetch updated data if needed
    } catch (error) {
      toast.error("Error creating invoice.");
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and manage invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
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
                  <Input id="expense-description" placeholder="Enter expense description" />
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
                  <Textarea id="expense-notes" placeholder="Additional notes (optional)" />
                </div>
                <Button className="w-full" onClick={handleExpenseSubmit}>
                  Record Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
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
                  <Input id="client-name" placeholder="Enter client name" />
                </div>
                <div>
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input id="client-email" type="email" placeholder="client@example.com" />
                </div>
                <div>
                  <Label htmlFor="invoice-amount">Amount (KES)</Label>
                  <Input id="invoice-amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="invoice-description">Description</Label>
                  <Textarea id="invoice-description" placeholder="Invoice description or items" />
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
            <div className="text-2xl font-bold text-success">{financialSummary.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{financialSummary.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{financialSummary.netProfit}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{financialSummary.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              5 invoices pending
            </p>
          </CardContent>
        </Card>
      </div>

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
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
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
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
