import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  History as HistoryIcon, 
  Activity, 
  Users, 
  ShoppingCart, 
  DollarSign,
  FileText,
  Settings,
  Download,
  Filter,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import ActivityHistory from '@/components/ActivityHistory';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const History = () => {
  const { user } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportHistory = async () => {
    try {
      setExportLoading(true);
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('History exported successfully!');
    } catch (error) {
      toast.error('Failed to export history');
    } finally {
      setExportLoading(false);
    }
  };

  const activityStats = [
    {
      title: "Total Activities",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Activity,
      description: "from last month"
    },
    {
      title: "User Actions",
      value: "892",
      change: "+8%",
      trend: "up",
      icon: Users,
      description: "from last month"
    },
    {
      title: "System Events",
      value: "355",
      change: "+15%",
      trend: "up",
      icon: Settings,
      description: "from last month"
    },
    {
      title: "Critical Events",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: FileText,
      description: "from last month"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HistoryIcon className="h-8 w-8 text-green-600" />
            Activity History
          </h1>
          <p className="text-muted-foreground">
            Comprehensive tracking of all system activities and user actions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={handleExportHistory}
            disabled={exportLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportLoading ? 'Exporting...' : 'Export History'}
          </Button>
          <Button
            onClick={() => {
              toast.info('Advanced filters feature coming soon!');
              // Could open a modal with advanced filtering options
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {activityStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingUp className="mr-1 h-3 w-3 text-red-600 rotate-180" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity History Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="user">User Actions</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Activity Log</CardTitle>
              <CardDescription>
                All system activities and user actions in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory showFilters={true} limit={50} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Actions</CardTitle>
              <CardDescription>
                Activities performed by users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterCategory="user"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>
                Automated system activities and background processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterCategory="system"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Events</CardTitle>
              <CardDescription>
                High-priority events that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistory 
                showFilters={true} 
                limit={50} 
                filterPriority="critical"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common history-related tasks and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <Calendar className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-sm">Schedule Report</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Clock className="h-6 w-6 mb-2 text-orange-600" />
              <span className="text-sm">Set Alerts</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <FileText className="h-6 w-6 mb-2 text-purple-600" />
              <span className="text-sm">Archive Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
