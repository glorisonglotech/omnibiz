import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Users,
  DollarSign,
  Phone,
  Mail,
  Edit,
  Trash2,
  Send,
  Bell,
  CreditCard,
  History,
  MessageSquare,
} from "lucide-react";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);

  const employees = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+254701234567",
      role: "Manager",
      salary: 45000,
      status: "Active",
      joinDate: "2023-01-15",
      lastPaid: "2024-01-01",
      notifications: { sms: true, email: true }
    },
    {
      id: 2,
      name: "Michael Ochieng",
      email: "michael@example.com",
      phone: "+254712345678",
      role: "Stylist",
      salary: 35000,
      status: "Active",
      joinDate: "2023-03-20",
      lastPaid: "2024-01-01",
      notifications: { sms: true, email: false }
    },
    {
      id: 3,
      name: "Grace Wanjiku",
      email: "grace@example.com",
      phone: "+254723456789",
      role: "Receptionist",
      salary: 25000,
      status: "Active",
      joinDate: "2023-06-10",
      lastPaid: "2024-01-01",
      notifications: { sms: false, email: true }
    },
    {
      id: 4,
      name: "David Kimani",
      email: "david@example.com",
      phone: "+254734567890",
      role: "Staff",
      salary: 30000,
      status: "On Leave",
      joinDate: "2023-08-05",
      lastPaid: "2023-12-01",
      notifications: { sms: true, email: true }
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      employeeName: "Sarah Johnson",
      amount: 45000,
      date: "2024-01-01",
      status: "Completed",
      transactionId: "TXN123456789",
      method: "M-Pesa"
    },
    {
      id: 2,
      employeeName: "Michael Ochieng",
      amount: 35000,
      date: "2024-01-01",
      status: "Completed",
      transactionId: "TXN123456790",
      method: "M-Pesa"
    },
    {
      id: 3,
      employeeName: "Grace Wanjiku",
      amount: 25000,
      date: "2024-01-01",
      status: "Failed",
      transactionId: "TXN123456791",
      method: "M-Pesa"
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge variant="default">Active</Badge>;
      case "On Leave":
        return <Badge variant="secondary">On Leave</Badge>;
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge variant="default">Completed</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSalaryBudget = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const activeEmployees = employees.filter(emp => emp.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage employees, payroll, and notifications</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isPayrollOpen} onOpenChange={setIsPayrollOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                M-Pesa Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>M-Pesa Payroll Management</DialogTitle>
                <DialogDescription>
                  Send salaries directly to employee phone numbers via M-Pesa
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="pay-salary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pay-salary">Pay Salary</TabsTrigger>
                  <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="pay-salary" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employee-select">Select Employee</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.name} - KSh {emp.salary.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (KSh)</Label>
                        <Input id="amount" placeholder="45,000" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="+254701234567" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Payment Message (Optional)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Salary payment for January 2024"
                        className="resize-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="sms-receipt"  />
                      <Label htmlFor="sms-receipt">Send SMS receipt</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className='text-red-500 cursor-pointer hover:text-red-500' onClick={() => setIsPayrollOpen(false)}>
                      Cancel
                    </Button>
                    <Button className='bg-green-500 cursor-pointer hover:bg-green-400'>
                      <Send className="mr-2 h-4 w-4" />
                      Send Payment
                    </Button>
                  </DialogFooter>
                </TabsContent>
                <TabsContent value="payment-history">
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Transaction ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.employeeName}</TableCell>
                            <TableCell>KSh {payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                            <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className='bg-green-500 cursor-pointer hover:bg-green-400'>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Register a new team member to your business
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="employee@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+254701234567" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="stylist">Stylist</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Monthly Salary (KSh)</Label>
                    <Input id="salary" placeholder="35,000" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Notification Preferences</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                    <Switch id="sms-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch id="email-notifications" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className='text-red-500 cursor-pointer hover:text-red-400' onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button className='bg-green-500 cursor-pointer hover:bg-green-400' onClick={() => setIsAddEmployeeOpen(false)}>
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">{activeEmployees} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {totalSalaryBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total monthly budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 1</div>
            <p className="text-xs text-muted-foreground">Next due: Feb 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Manage your team members and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Stylist">Stylist</SelectItem>
                <SelectItem value="Receptionist">Receptionist</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Joined {new Date(employee.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {employee.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>KSh {employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {employee.notifications.sms && (
                        <Badge variant="outline" className="text-xs">SMS</Badge>
                      )}
                      {employee.notifications.email && (
                        <Badge variant="outline" className="text-xs">Email</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;