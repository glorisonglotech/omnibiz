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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Mail,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Monitor,
  Sun,
  Moon,
  Zap,
  Volume2,
  VolumeX,
  Accessibility,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme, AVAILABLE_THEMES } from "@/context/ThemeContext";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { toast } from "sonner";
import ThemeCustomizer from "@/components/ThemeCustomizer";

const Settings = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    animations,
    setAnimations,
    fontSize,
    setFontSize,
    fontSizes,
    borderRadius,
    setBorderRadius,
    borderRadiusOptions,
    compactMode,
    setCompactMode,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    customAccentColor,
    setCustomAccentColor,
    soundEnabled,
    setSoundEnabled,
    autoSave,
    setAutoSave
  } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    businessName: "OmniBiz",
    businessEmail: "admin@omnibiz.com",
    businessPhone: "+254 700 123 456",
    businessAddress: "123 Business Street, Nairobi",
    timezone: "Africa/Nairobi",
    currency: "KES",
    language: "en",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    soundNotifications: true,
    desktopNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAlerts: true,
    deviceTracking: true,

    // Appearance Settings
    theme: "light",
    sidebarCollapsed: false,
    compactMode: false,
    highContrast: false,
    reducedMotion: false,
    customAccentColor: "#3b82f6",

    // Privacy Settings
    dataSharing: false,
    analytics: true,
    crashReporting: true,
    usageStatistics: false,

    // Performance Settings
    autoSave: true,
    cacheSize: 100,
    backgroundSync: true,

    // Account Settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view settings.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;

        // Map user data to settings format
        setSettings(prev => ({
          ...prev,
          businessName: userData.businessName || prev.businessName,
          businessEmail: userData.businessEmail || prev.businessEmail,
          businessPhone: userData.businessPhone || prev.businessPhone,
          businessAddress: userData.businessAddress || prev.businessAddress,
          timezone: userData.timezone || prev.timezone,
          currency: userData.currency || prev.currency,
          language: userData.language || prev.language,
          emailNotifications: userData.emailNotifications ?? prev.emailNotifications,
          smsNotifications: userData.smsNotifications ?? prev.smsNotifications,
          pushNotifications: userData.pushNotifications ?? prev.pushNotifications,
          marketingEmails: userData.marketingEmails ?? prev.marketingEmails,
          twoFactorAuth: userData.twoFactorAuth ?? prev.twoFactorAuth,
          sessionTimeout: userData.sessionTimeout?.toString() || prev.sessionTimeout,
          passwordExpiry: userData.passwordExpiry?.toString() || prev.passwordExpiry,
          dataSharing: userData.dataSharing ?? prev.dataSharing,
          analytics: userData.analytics ?? prev.analytics,
        }));
      } catch (error) {
        toast.error("Error fetching settings.");
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, [isAuthenticated]);

  const handleSaveSettings = async (section) => {
    try {
      const token = localStorage.getItem("token");

      // Prepare settings data for the specific section
      let sectionSettings = {};

      switch (section) {
        case 'general':
          sectionSettings = {
            businessName: settings.businessName,
            businessEmail: settings.businessEmail,
            businessPhone: settings.businessPhone,
            businessAddress: settings.businessAddress,
            timezone: settings.timezone,
            currency: settings.currency,
            language: settings.language
          };
          break;
        case 'notifications':
          sectionSettings = {
            emailNotifications: settings.emailNotifications,
            smsNotifications: settings.smsNotifications,
            pushNotifications: settings.pushNotifications,
            marketingEmails: settings.marketingEmails
          };
          break;
        case 'security':
          sectionSettings = {
            twoFactorAuth: settings.twoFactorAuth,
            sessionTimeout: parseInt(settings.sessionTimeout),
            passwordExpiry: parseInt(settings.passwordExpiry)
          };
          break;
        case 'privacy':
          sectionSettings = {
            dataSharing: settings.dataSharing,
            analytics: settings.analytics
          };
          break;
      }

      await api.put("/user/settings", {
        section,
        settings: sectionSettings
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`${section} settings saved successfully!`);
    } catch (error) {
      toast.error(`Error saving ${section} settings.`);
      console.error(`Error saving ${section} settings:`, error);
    }
  };

  const handlePasswordChange = async () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      return toast.error("Please fill in all password fields.");
    }

    if (settings.newPassword !== settings.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    if (settings.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }

    try {
      const token = localStorage.getItem("token");

      await api.put("/user/change-password", {
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Password changed successfully!");
      setSettings({
        ...settings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Error changing password.");
      console.error("Error changing password:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure your business information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.businessName}
                    onChange={(e) =>
                      setSettings({ ...settings, businessName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, businessEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={settings.businessPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, businessPhone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) =>
                      setSettings({ ...settings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      setSettings({ ...settings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      setSettings({ ...settings, language: value })
                    }
                  >
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
              </div>
              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={settings.businessAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, businessAddress: e.target.value })
                  }
                />
              </div>
              <Button onClick={() => handleSaveSettings("general")}>
                <Save className="mr-2 h-4 w-4" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, smsNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, marketingEmails: checked })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("notifications")}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, twoFactorAuth: checked })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          setSettings({ ...settings, sessionTimeout: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) =>
                          setSettings({ ...settings, passwordExpiry: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleSaveSettings("security")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={settings.currentPassword}
                      onChange={(e) =>
                        setSettings({ ...settings, currentPassword: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) =>
                      setSettings({ ...settings, newPassword: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) =>
                      setSettings({ ...settings, confirmPassword: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handlePasswordChange}>
                  <Save className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <ThemeCustomizer />
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow sharing of anonymized data for product improvement
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, dataSharing: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow collection of usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, analytics: checked })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSaveSettings("privacy")}>
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
