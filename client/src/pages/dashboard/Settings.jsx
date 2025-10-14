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
  ExternalLink,
  Building,
  Phone,
  MapPin,
  Clock,
  Languages,
  ShieldCheck,
  Lock,
  Trash2,
  Database,
  ChartBar
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme, AVAILABLE_THEMES } from "@/context/ThemeContext";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { toast } from "sonner";
import ThemeCustomizer from "@/components/ThemeCustomizer";

const Settings = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  // Enhanced settings state with all destructured elements integrated
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
    soundNotifications: soundEnabled,
    desktopNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAlerts: true,
    deviceTracking: true,

    // Appearance Settings (using destructured theme context)
    theme: theme || "light",
    sidebarCollapsed: sidebarCollapsed,
    compactMode: compactMode,
    highContrast: highContrast,
    reducedMotion: reducedMotion,
    customAccentColor: customAccentColor,
    animations: animations,
    fontSize: fontSize,
    borderRadius: borderRadius,

    // Privacy Settings
    dataSharing: false,
    analytics: true,
    crashReporting: true,
    usageStatistics: false,

    // Performance Settings
    autoSave: autoSave,
    cacheSize: 100,
    backgroundSync: true,

    // Account Settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync theme context with settings
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme,
      sidebarCollapsed: sidebarCollapsed,
      compactMode: compactMode,
      highContrast: highContrast,
      reducedMotion: reducedMotion,
      customAccentColor: customAccentColor,
      animations: animations,
      fontSize: fontSize,
      borderRadius: borderRadius,
      soundNotifications: soundEnabled,
      autoSave: autoSave
    }));
  }, [
    theme, sidebarCollapsed, compactMode, highContrast, reducedMotion,
    customAccentColor, animations, fontSize, borderRadius, soundEnabled, autoSave
  ]);

  // Enhanced fetch settings with better error handling
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view settings.");
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;

        // Enhanced settings mapping with fallbacks
        setSettings(prev => ({
          ...prev,
          businessName: userData.businessName || userData.name || prev.businessName,
          businessEmail: userData.businessEmail || userData.email || prev.businessEmail,
          businessPhone: userData.businessPhone || userData.phone || prev.businessPhone,
          businessAddress: userData.businessAddress || userData.address || prev.businessAddress,
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
        console.error("Error fetching settings:", error);
        toast.error(
          error.response?.data?.message || "Error fetching settings. Using default settings."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated]);

  // Enhanced save settings with progress tracking
  const handleSaveSettings = async (section) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      let sectionSettings = {};
      let endpoint = "/user/settings";
      let method = "put";

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
            marketingEmails: settings.marketingEmails,
            soundNotifications: settings.soundNotifications
          };
          // Update soundEnabled in theme context
          setSoundEnabled(settings.soundNotifications);
          break;
        case 'security':
          sectionSettings = {
            twoFactorAuth: settings.twoFactorAuth,
            sessionTimeout: parseInt(settings.sessionTimeout),
            passwordExpiry: parseInt(settings.passwordExpiry),
            loginAlerts: settings.loginAlerts,
            deviceTracking: settings.deviceTracking
          };
          break;
        case 'appearance':
          sectionSettings = {
            theme: settings.theme,
            sidebarCollapsed: settings.sidebarCollapsed,
            compactMode: settings.compactMode,
            highContrast: settings.highContrast,
            reducedMotion: settings.reducedMotion,
            customAccentColor: settings.customAccentColor,
            animations: settings.animations,
            fontSize: settings.fontSize,
            borderRadius: settings.borderRadius
          };
          // Update theme context
          setTheme(settings.theme);
          setSidebarCollapsed(settings.sidebarCollapsed);
          setCompactMode(settings.compactMode);
          setHighContrast(settings.highContrast);
          setReducedMotion(settings.reducedMotion);
          setCustomAccentColor(settings.customAccentColor);
          setAnimations(settings.animations);
          setFontSize(settings.fontSize);
          setBorderRadius(settings.borderRadius);
          break;
        case 'privacy':
          sectionSettings = {
            dataSharing: settings.dataSharing,
            analytics: settings.analytics,
            crashReporting: settings.crashReporting,
            usageStatistics: settings.usageStatistics
          };
          break;
        case 'performance':
          sectionSettings = {
            autoSave: settings.autoSave,
            cacheSize: settings.cacheSize,
            backgroundSync: settings.backgroundSync
          };
          setAutoSave(settings.autoSave);
          break;
      }

      await api[method](endpoint, {
        section,
        settings: sectionSettings
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHasUnsavedChanges(false);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast.error(
        error.response?.data?.message || `Error saving ${section} settings.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced password change with better validation
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

    // Enhanced password strength check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(settings.newPassword)) {
      return toast.error("Password must include uppercase, lowercase, number, and special character.");
    }

    try {
      setIsLoading(true);
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
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message || "Error changing password. Please check your current password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting changes with unsaved changes tracking
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Reset settings to defaults
  const handleResetSettings = (section) => {
    const defaults = {
      general: {
        businessName: "OmniBiz",
        businessEmail: "admin@omnibiz.com",
        businessPhone: "+254 700 123 456",
        businessAddress: "123 Business Street, Nairobi",
        timezone: "Africa/Nairobi",
        currency: "KES",
        language: "en",
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        soundNotifications: true,
      }
      // Add more sections as needed
    };

    if (defaults[section]) {
      setSettings(prev => ({ ...prev, ...defaults[section] }));
      toast.info(`${section} settings reset to defaults`);
    }
  };

  // Enhanced loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to access settings</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with User Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            {user?.role || 'User'}
          </Badge>
        </div>
      </div>

      {/* Enhanced Tabs with Icons */}
      <Tabs defaultValue="general" value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Enhanced General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Configure your business details and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={settings.businessName}
                      onChange={(e) => handleSettingChange("businessName", e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Business Email
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={settings.businessEmail}
                      onChange={(e) => handleSettingChange("businessEmail", e.target.value)}
                      placeholder="business@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Business Phone
                    </Label>
                    <Input
                      id="businessPhone"
                      value={settings.businessPhone}
                      onChange={(e) => handleSettingChange("businessPhone", e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timezone
                    </Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleSettingChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Nairobi">East Africa Time (Nairobi)</SelectItem>
                        <SelectItem value="Africa/Cairo">Eastern European Time (Cairo)</SelectItem>
                        <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (London)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Currency
                    </Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => handleSettingChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                        <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Language
                    </Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="businessAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </Label>
                <Textarea
                  id="businessAddress"
                  value={settings.businessAddress}
                  onChange={(e) => handleSettingChange("businessAddress", e.target.value)}
                  placeholder="Enter your business address"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleSaveSettings("general")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save General Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleResetSettings("general")}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get urgent alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Real-time notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      {settings.soundNotifications ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Sound Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sounds for new notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundNotifications}
                    onCheckedChange={(checked) => handleSettingChange("soundNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <ChartBar className="h-4 w-4" />
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotions and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleSaveSettings("notifications")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Notification Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleResetSettings("notifications")}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Security Preferences
                </CardTitle>
                <CardDescription>
                  Enhance your account security with these settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Two-Factor Authentication
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Extra security layer for your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="1440"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatic logout after inactivity
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="passwordExpiry" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Password Expiry (days)
                      </Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSettingChange("passwordExpiry", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Require password change periodically
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Login Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified of new sign-ins
                      </p>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Device Tracking
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Monitor active devices and sessions
                      </p>
                    </div>
                    <Switch
                      checked={settings.deviceTracking}
                      onCheckedChange={(checked) => handleSettingChange("deviceTracking", checked)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => handleSaveSettings("security")}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Change Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password for enhanced security
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
                      onChange={(e) => handleSettingChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
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
                    onChange={(e) => handleSettingChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => handleSettingChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isLoading || !settings.currentPassword || !settings.newPassword || !settings.confirmPassword}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Appearance Settings */}
        <TabsContent value="appearance">
          <ThemeCustomizer />
        </TabsContent>

        {/* Enhanced Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Privacy & Data Settings
              </CardTitle>
              <CardDescription>
                Control how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Data Sharing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data to help improve our services
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <ChartBar className="h-4 w-4" />
                      Usage Analytics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use the application
                    </p>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Crash Reporting
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically report errors and crashes
                    </p>
                  </div>
                  <Switch
                    checked={settings.crashReporting}
                    onCheckedChange={(checked) => handleSettingChange("crashReporting", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Usage Statistics
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Collect data about feature usage and performance
                    </p>
                  </div>
                  <Switch
                    checked={settings.usageStatistics}
                    onCheckedChange={(checked) => handleSettingChange("usageStatistics", checked)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Privacy Information</h4>
                    <p className="text-sm text-muted-foreground">
                      We respect your privacy. All data collection is anonymized and used solely 
                      to improve your experience. You can review our privacy policy for more details.
                    </p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      View Privacy Policy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleSaveSettings("privacy")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Privacy Settings
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;