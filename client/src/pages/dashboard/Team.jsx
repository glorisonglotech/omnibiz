import { useState, useEffect } from "react";
import axios from "axios";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const { user, isAuthenticated, loading } = useAuth();

  const normalizeEmployee = (e) => ({
    _id: e._id || e.id,
    name: e.name ?? e.fullName ?? "",
    email: e.email ?? e.contactEmail ?? "",
    phone: e.phone ?? e.phoneNumber ?? "",
    role: e.role ?? "",
    salary: e.salary ?? 0,
    status: e.status ?? "Active",
    notifications: {
      sms: e.notifications?.sms ?? e.notifyBySMS ?? false,
      email: e.notifications?.email ?? e.notifyByEmail ?? false,
    },
    joinDate: e.joinDate ?? e.createdAt ?? null,
  });

  // Employee state
  const [employees, setEmployees] = useState([]);
  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Add employee form state
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    salary: "",
    profilePhoto: "",
    notifications: { sms: false, email: false },
  });

  // Payroll form state
  const [payroll, setPayroll] = useState({
    employeeId: "",
    amount: "",
    phone: "",
    message: "",
    smsReceipt: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem("token");
        const [empRes, payRes] = await Promise.all([
          api.get("/team", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/expenses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setEmployees((empRes.data || []).map(normalizeEmployee));
        setPaymentHistory(payRes.data || []);
      } catch (err) {
        toast.error("Failed to fetch data");
        console.error(err);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleAddEmployee = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    const { name, email, phone, role, salary, notifications } = newEmployee;

    if (!name || !email || !role) {
      return toast.error("Name, email and role are required.");
    }

    // Check for duplicate email
    const existingEmployee = employees.find(emp => emp.contactEmail?.toLowerCase() === email.toLowerCase());
    if (existingEmployee) {
      return toast.error("An employee with this email already exists.");
    }

    // Check for duplicate phone if provided
    if (phone && employees.find(emp => emp.phoneNumber === phone)) {
      return toast.error("An employee with this phone number already exists.");
    }

    try {
      const res = await api.post(
        "/team",
        {
          fullName: name,
          contactEmail: email,
          phoneNumber: phone,
          role,
          salary: Number(salary) || 0,
          profilePhoto: newEmployee.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
          notifyBySMS: notifications.sms,
          notifyByEmail: notifications.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prev) => [...prev, res.data]);
      setIsAddEmployeeOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        phone: "",
        role: "",
        salary: "",
        profilePhoto: "",
        notifications: { sms: false, email: false },
      });
      toast.success("Employee added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding employee.");
      console.error(err);
    }
  };

  const handleEditClick = (emp) => {
    setEditEmployee({ ...emp, salary: String(emp.salary ?? "") });
    setIsEditEmployeeOpen(true);
  };
  const handleEditEmployeeChange = (field, value) => {
    setEditEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateEmployee = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editEmployee?._id) return;

    try {
      const res = await api.put(
        `/team/${editEmployee._id}`,
        {
          fullName: editEmployee.name,
          contactEmail: editEmployee.email,
          phoneNumber: editEmployee.phone,
          role: editEmployee.role,
          salary: Number(editEmployee.salary) || 0,
          notifyBySMS: editEmployee.notifications?.sms,
          notifyByEmail: editEmployee.notifications?.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prev) =>
        prev.map((e) => (e._id === res.data._id ? res.data : e))
      );
      setIsEditEmployeeOpen(false);
      setEditEmployee(null);
      toast.success("Employee updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating employee.");
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    try {
      await api.delete(`/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees((prev) => prev.filter((e) => (e._id || e.id) !== id));
      toast.success("Employee deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting employee.");
      console.error(err);
    }
  };

  // Payroll handler with M-Pesa integration
  const handleSendPayroll = async () => {
    if (!payroll.employeeId || !payroll.amount || !payroll.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      // First, initiate M-Pesa payment
      const mpesaResponse = await api.post("/payments/mpesa/initiate", {
        phoneNumber: payroll.phone,
        amount: Number(payroll.amount),
        description: `Payroll payment for ${employees.find(emp => emp._id === payroll.employeeId)?.fullName || 'Employee'}`
      });

      if (mpesaResponse.data.success) {
        // Create expense record for payroll
        await api.post("/expenses", {
          employeeId: payroll.employeeId,
          amount: Number(payroll.amount),
          phone: payroll.phone,
          message: payroll.message,
          smsReceipt: payroll.smsReceipt,
          paymentMethod: "M-Pesa",
          transactionId: mpesaResponse.data.transactionId,
          category: "Payroll",
          description: `Payroll payment via M-Pesa for ${employees.find(emp => emp._id === payroll.employeeId)?.fullName || 'Employee'}`
        });

        setIsPayrollOpen(false);
        setPayroll({
          employeeId: "",
          amount: "",
          phone: "",
          message: "",
          smsReceipt: false,
        });

        // Refetch payment history
        api.get("/expenses").then((res) => setPaymentHistory(res.data));

        toast.success("M-Pesa payment initiated successfully! Employee will receive payment prompt.");
      } else {
        throw new Error(mpesaResponse.data.message || "M-Pesa payment failed");
      }
    } catch (err) {
      console.error("Payroll payment error:", err);
      toast.error(err.response?.data?.message || "Error sending payroll payment. Please try again.");
    }
  };

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

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalSalaryBudget = employees.reduce(
    (sum, emp) => sum + (emp.salary || 0),
    0
  );
  const activeEmployees = employees.filter(
    (emp) => emp.status === "Active"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage employees, payroll, and notifications
          </p>
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
                  <TabsTrigger value="payment-history">
                    Payment History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pay-salary" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employee-select">Select Employee</Label>
                      <Select
                        value={payroll.employeeId}
                        onValueChange={(val) =>
                          setPayroll((p) => ({ ...p, employeeId: val }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem
                              key={emp._id || emp.id}
                              value={emp._id || emp.id}
                            >
                              {emp.name} - KSh {emp.salary?.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (KSh)</Label>
                        <Input
                          id="amount"
                          placeholder="45,000"
                          value={payroll.amount}
                          onChange={(e) =>
                            setPayroll((p) => ({
                              ...p,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+254701234567"
                          value={payroll.phone}
                          onChange={(e) =>
                            setPayroll((p) => ({ ...p, phone: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">
                        Payment Message (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Salary payment for January 2024"
                        className="resize-none"
                        value={payroll.message}
                        onChange={(e) =>
                          setPayroll((p) => ({ ...p, message: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sms-receipt"
                        checked={payroll.smsReceipt}
                        onCheckedChange={(val) =>
                          setPayroll((p) => ({ ...p, smsReceipt: val }))
                        }
                      />
                      <Label htmlFor="sms-receipt">Send SMS receipt</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="text-red-500 cursor-pointer hover:text-red-500"
                      onClick={() => setIsPayrollOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-500 cursor-pointer hover:bg-green-400"
                      onClick={handleSendPayroll}
                    >
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
                          <TableRow key={payment._id || payment.id}>
                            <TableCell>{payment.employeeName}</TableCell>
                            <TableCell>
                              KSh {payment.amount?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {payment.date
                                ? new Date(payment.date).toLocaleDateString()
                                : ""}
                            </TableCell>
                            <TableCell>
                              {getPaymentStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.transactionId}
                            </TableCell>
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
              <Button className="bg-green-500 cursor-pointer hover:bg-green-400">
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
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee((emp) => ({
                        ...emp,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@example.com"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee((emp) => ({
                        ...emp,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254701234567"
                    value={newEmployee.phone}
                    onChange={(e) =>
                      setNewEmployee((emp) => ({
                        ...emp,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profilePhoto">Profile Photo URL (Optional)</Label>
                  <Input
                    id="profilePhoto"
                    placeholder="https://example.com/photo.jpg"
                    value={newEmployee.profilePhoto}
                    onChange={(e) =>
                      setNewEmployee((emp) => ({
                        ...emp,
                        profilePhoto: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate an avatar based on the name
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(val) =>
                        setNewEmployee((emp) => ({ ...emp, role: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Stylist">Stylist</SelectItem>
                        <SelectItem value="Receptionist">
                          Receptionist
                        </SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="salary">Monthly Salary (KSh)</Label>
                    <Input
                      id="salary"
                      placeholder="35,000"
                      value={newEmployee.salary}
                      onChange={(e) =>
                        setNewEmployee((emp) => ({
                          ...emp,
                          salary: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Notification Preferences</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="sms-notifications">
                        SMS Notifications
                      </Label>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={newEmployee.notifications.sms}
                      onCheckedChange={(val) =>
                        setNewEmployee((emp) => ({
                          ...emp,
                          notifications: { ...emp.notifications, sms: val },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={newEmployee.notifications.email}
                      onCheckedChange={(val) =>
                        setNewEmployee((emp) => ({
                          ...emp,
                          notifications: { ...emp.notifications, email: val },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="text-red-500 cursor-pointer hover:text-red-400"
                  onClick={() => setIsAddEmployeeOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-500 cursor-pointer hover:bg-green-400"
                  onClick={handleAddEmployee}
                >
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
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Payroll
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {totalSalaryBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total monthly budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentHistory[0]?.date
                ? new Date(paymentHistory[0].date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Next due: Feb 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notifications Sent
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Manage your team members and their details
          </CardDescription>
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
                <TableRow key={employee._id || employee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Joined{" "}
                        {employee.joinDate
                          ? new Date(employee.joinDate).toLocaleDateString()
                          : ""}
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
                  <TableCell>KSh {employee.salary?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {employee.notifications?.sms && (
                        <Badge variant="outline" className="text-xs">
                          SMS
                        </Badge>
                      )}
                      {employee.notifications?.email && (
                        <Badge variant="outline" className="text-xs">
                          Email
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(employee)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteEmployee(employee._id || employee.id)
                        }
                      >
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
      {isEditEmployeeOpen && editEmployee && (
        <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label>Name</Label>
              <Input
                value={editEmployee.name}
                onChange={(e) =>
                  handleEditEmployeeChange("name", e.target.value)
                }
              />
              <Label>Email</Label>
              <Input
                type="email"
                value={editEmployee.email}
                onChange={(e) =>
                  handleEditEmployeeChange("email", e.target.value)
                }
              />
              <Label>Phone</Label>
              <Input
                value={editEmployee.phone}
                onChange={(e) =>
                  handleEditEmployeeChange("phone", e.target.value)
                }
              />
              <Label>Role</Label>
              <Input
                value={editEmployee.role}
                onChange={(e) =>
                  handleEditEmployeeChange("role", e.target.value)
                }
              />
              <Label>Salary</Label>
              <Input
                type="number"
                value={editEmployee.salary}
                onChange={(e) =>
                  handleEditEmployeeChange("salary", e.target.value)
                }
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditEmployeeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-400"
                onClick={handleUpdateEmployee}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Team;
