import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  AlertTriangle,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Eye,
  Ban,
  Filter,
  Settings,
  Brain,
  Server,
  Database,
  Network,
  Download,
  Upload,
  BarChart,
  PieChart,
  AlertCircle,
  Cpu
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

const SecurityDashboard = () => {
  const { socket, connected } = useSocket();
  const [securityLogs, setSecurityLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [aiConfig, setAiConfig] = useState({
    autoFix: true,
    aiAnalysis: true,
    realTimeMonitoring: true,
    threatPrediction: true,
    behavioralLearning: true,
    anomalyThreshold: 'medium'
  });
  const [systemHealth, setSystemHealth] = useState(null);
  const [threatLevel, setThreatLevel] = useState('low');

  useEffect(() => {
    fetchSecurityData();
    joinSecurityRoom();
  }, []);

  // Real-time security alerts
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('security_alert', handleSecurityAlert);
    socket.on('new_security_event', handleNewSecurityEvent);

    return () => {
      socket.off('security_alert');
      socket.off('new_security_event');
    };
  }, [socket, connected]);

  const joinSecurityRoom = () => {
    if (socket && connected) {
      socket.emit('join_security_dashboard');
    }
  };

  const handleSecurityAlert = (alert) => {
    setAlerts(prev => {
      const currentAlerts = Array.isArray(prev) ? prev : [];
      return [alert, ...currentAlerts];
    });
    
    // Show toast notification based on severity
    const toastFn = alert.severity === 'critical' ? toast.error :
                     alert.severity === 'high' ? toast.warning :
                     toast.info;
    
    toastFn(
      <div>
        <strong>{alert.title}</strong>
        <p className="text-sm">{alert.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          IP: {alert.ipAddress} | User: {alert.user}
        </p>
      </div>
    );
  };

  const handleNewSecurityEvent = (event) => {
    setSecurityLogs(prev => {
      const currentLogs = Array.isArray(prev) ? prev : [];
      const newLogs = [event.securityLog, ...currentLogs].slice(0, 100);
      return newLogs;
    });
  };

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [logsRes, statsRes, alertsRes] = await Promise.all([
        api.get("/security/logs", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/security/stats", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/security/alerts", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSecurityLogs(logsRes.data.logs || []);
      setStats(statsRes.data || {});
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error("Error fetching security data:", error);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (logId) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/security/logs/${logId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Alert marked as resolved");
      fetchSecurityData();
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to resolve alert");
    }
  };

  const handleUnblockIP = async (ipAddress) => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/security/unblock-ip", { ipAddress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`IP ${ipAddress} unblocked`);
      fetchSecurityData();
    } catch (error) {
      console.error("Error unblocking IP:", error);
      toast.error("Failed to unblock IP");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Activity className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const filteredLogs = (Array.isArray(securityLogs) ? securityLogs : []).filter(log => {
    if (filter !== 'all' && log.severity !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.description?.toLowerCase().includes(search) ||
        log.userEmail?.toLowerCase().includes(search) ||
        log.ipAddress?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            AI Security Monitoring
          </h1>
          <p className="text-muted-foreground">
            Real-time threat detection and automated response •
            {connected ? (
              <span className="text-green-600"> 🟢 Live Monitoring</span>
            ) : (
              <span className="text-red-600"> 🔴 Offline</span>
            )}
          </p>
        </div>
        <Button onClick={fetchSecurityData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events (24h)</p>
                <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.bySeverity?.critical || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold">{stats?.blockedIPs || 0}</p>
              </div>
              <Ban className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Fixed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.autoFixed || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Active Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Security Logs
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Zap className="h-4 w-4 mr-2" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="intelligence">
            <Brain className="h-4 w-4 mr-2" />
            AI Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
              <CardDescription>
                Real-time security threats detected by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active security alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {getSeverityIcon(alert.severity)}
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-lg mb-2">{alert.title}</h4>
                          <p className="text-sm text-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {alert.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {alert.ipAddress}
                            </span>
                          </div>
                          {alert.suggestion && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                AI Suggestion:
                              </p>
                              <p className="text-sm text-blue-800 mt-1">{alert.suggestion}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {alert.logId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveAlert(alert.logId)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Event Logs</CardTitle>
                  <CardDescription>Comprehensive activity tracking</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User/IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)} variant="outline">
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.eventType}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{log.userEmail || 'Unknown'}</div>
                        <div className="text-muted-foreground">{log.ipAddress}</div>
                      </TableCell>
                      <TableCell>
                        {log.resolved ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Open
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>AI Security Recommendations</CardTitle>
              <CardDescription>
                Automated security improvements and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.filter(a => a.suggestion).map((alert, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-blue-800 mb-2">{alert.suggestion}</p>
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <Badge variant="outline" className="bg-white">
                            Priority: {alert.severity}
                          </Badge>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {alerts.filter(a => a.suggestion).length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Recommendations</h3>
                    <p className="text-muted-foreground">
                      Your security posture is excellent!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="config">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  AI Security Settings
                </CardTitle>
                <CardDescription>Configure automated security responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      Auto-Fix Enabled
                    </h4>
                    <p className="text-sm text-muted-foreground">Automatically fix detected threats</p>
                  </div>
                  <input type="checkbox" checked={aiConfig.autoFix} onChange={(e) => setAiConfig({...aiConfig, autoFix: e.target.checked})} className="h-5 w-5 rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      AI Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground">Use AI for threat pattern recognition</p>
                  </div>
                  <input type="checkbox" checked={aiConfig.aiAnalysis} onChange={(e) => setAiConfig({...aiConfig, aiAnalysis: e.target.checked})} className="h-5 w-5 rounded" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      Real-Time Monitoring
                    </h4>
                    <p className="text-sm text-muted-foreground">Continuous threat monitoring</p>
                  </div>
                  <input type="checkbox" checked={aiConfig.realTimeMonitoring} onChange={(e) => setAiConfig({...aiConfig, realTimeMonitoring: e.target.checked})} className="h-5 w-5 rounded" />
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">Anomaly Detection Threshold</h4>
                  <select value={aiConfig.anomalyThreshold} onChange={(e) => setAiConfig({...aiConfig, anomalyThreshold: e.target.value})} className="w-full p-2 border rounded-md">
                    <option value="low">Low (More Alerts)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Critical Only)</option>
                  </select>
                </div>

                <Button onClick={() => toast.success('AI Configuration saved')} className="w-full">Save Configuration</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Detection Rules</CardTitle>
                <CardDescription>Configure detection thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Failed Login Attempts</label>
                  <Input type="number" defaultValue="5" min="1" max="10" />
                  <p className="text-xs text-muted-foreground">Current: 5 attempts in 5 minutes</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Rate Limit (requests/minute)</label>
                  <Input type="number" defaultValue="100" min="10" max="1000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Lock Duration (minutes)</label>
                  <Input type="number" defaultValue="30" min="5" max="120" />
                </div>
                <Button onClick={() => toast.success('Thresholds updated')} className="w-full" variant="outline">Update Thresholds</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Intelligence Tab */}
        <TabsContent value="intelligence">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  AI Intelligence System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <span className="text-sm font-medium">AI Model Status</span>
                    <Badge className="bg-green-100 text-green-800 ml-2">Active</Badge>
                    <p className="text-2xl font-bold mt-2">99.8%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-sm font-medium">Detection Accuracy</span>
                    <p className="text-2xl font-bold mt-2">96.5%</p>
                    <p className="text-xs text-muted-foreground">Last 24h</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-sm font-medium">Response Time</span>
                    <p className="text-2xl font-bold mt-2">342ms</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Threat Intelligence Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'SQL Injection', detected: 142, severity: 'critical' },
                    { type: 'XSS Attempts', detected: 89, severity: 'high' },
                    { type: 'Brute Force', detected: 67, severity: 'high' },
                    { type: 'API Abuse', detected: 234, severity: 'medium' }
                  ].map((threat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 ${threat.severity === 'critical' ? 'text-red-600' : threat.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
                        <div>
                          <h4 className="font-medium text-sm">{threat.type}</h4>
                          <p className="text-xs text-muted-foreground">Detected: {threat.detected}</p>
                        </div>
                      </div>
                      <Badge className={threat.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>{threat.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Pattern Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Normal User Behavior</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Session duration: 15-25 minutes</li>
                      <li>• Peak activity: 9 AM - 6 PM</li>
                      <li>• API calls: 20-40 per session</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <h4 className="font-semibold text-green-900 mb-2">AI Learning Progress</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>User Behavior Models</span>
                          <span>87%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attack Pattern Database</span>
                          <span>94%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
