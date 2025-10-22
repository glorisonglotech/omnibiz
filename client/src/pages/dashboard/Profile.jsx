import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Save,
  Camera,
  Shield,
  Award,
  Clock,
  Building,
  Star,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  Download,
  Upload,
  Link,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  EyeOff,
  Bell,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  X,
  ChevronRight,
  Trash2,
  Copy,
  ExternalLink,
  QrCode,
  Smartphone,
  Monitor,
  Palette,
  Volume2,
  Lock,
  Key,
  CreditCard,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Gamepad2,
  Coffee,
  Plane,
  Car,
  Home,
  Sparkles,
  Crown,
  Flame,
  Rocket,
  Diamond,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop,
  Filter,
  Image as ImageIcon,
  UserPlus,
  MailPlus,
  CalendarDays,
  MapPin as MapPinIcon,
  Languages,
  BookOpen,
  Trophy,
  Medal,
  Gift,
  Sparkle,
  CrownIcon,
  Shield as ShieldIcon,
  BellRing,
  DownloadCloud,
  UploadCloud,
  ScanFace,
  Palette as PaletteIcon,
  Contrast,
  Sun,
  Moon,
  Laptop,
  Smartphone as SmartphoneIcon,
  Tablet,
  Monitor as MonitorIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import OnlineStatusIndicator from "@/components/OnlineStatusIndicator";
import api from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, customAccentColor } = useAppTheme();
  const { isOnline } = useOnlineStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQRCode, setShowQRCode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    dateOfBirth: "",
    gender: "",
    jobTitle: "",
    department: "",
    bio: "",
    avatar: "",
    coverImage: "",
    website: "",
    linkedin: "",
    twitter: "",
    github: "",
    instagram: "",
    skills: [],
    languages: [],
    interests: [],
    timezone: "UTC",
    emergencyContact: "",
    emergencyPhone: "",
    pronouns: "",
    location: "",
    workingHours: "9:00 AM - 5:00 PM",
    availability: "available",
    customFields: {},
  });

  const [profileStats, setProfileStats] = useState({
    completionRate: 0,
    profileViews: 0,
    connections: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProjects: 0,
    teamMembers: 0,
    rating: 0,
    reviewsCount: 0,
    engagements: 0,
    totalSales: 0,
    achievements: []
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    profileVisibility: "public",
    showActivity: true,
    showStats: true,
    allowMessages: true,
    showOnlineStatus: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    deviceTracking: true,
    passwordLastChanged: "2024-01-15",
  });

  const [activityData, setActivityData] = useState([]);

  const [skillsData, setSkillsData] = useState([
    { name: "JavaScript", level: 90, category: "Programming" },
    { name: "React", level: 85, category: "Frontend" },
    { name: "Node.js", level: 80, category: "Backend" },
    { name: "Python", level: 75, category: "Programming" },
    { name: "UI/UX Design", level: 70, category: "Design" },
    { name: "Project Management", level: 85, category: "Management" },
  ]);

  const [connectionsData, setConnectionsData] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [showAddConnectionDialog, setShowAddConnectionDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({ email: '', message: '' });
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch connections data
  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const response = await api.get('/connections');
      setConnectionsData(response.data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      // Use fallback data if API fails
      setConnectionsData([
        { id: 1, name: "Sarah Johnson", role: "Product Manager", email: "sarah@example.com", avatar: "", mutual: 12, connected: true },
        { id: 2, name: "Mike Chen", role: "Developer", email: "mike@example.com", avatar: "", mutual: 8, connected: true },
        { id: 3, name: "Emily Davis", role: "Designer", email: "emily@example.com", avatar: "", mutual: 15, connected: false },
        { id: 4, name: "Alex Rodriguez", role: "Marketing Lead", email: "alex@example.com", avatar: "", mutual: 6, connected: true },
      ]);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Handle connection actions
  const handleConnect = async (connectionId) => {
    try {
      await api.post(`/connections/${connectionId}/connect`);
      setConnectionsData(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, connected: true } : conn
      ));
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleDisconnect = async (connectionId) => {
    try {
      await api.delete(`/connections/${connectionId}`);
      setConnectionsData(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, connected: false } : conn
      ));
      toast.success('Connection removed');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleAddConnection = async () => {
    if (!newConnection.email) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      await api.post('/connections/invite', newConnection);
      toast.success('Connection invitation sent!');
      setShowAddConnectionDialog(false);
      setNewConnection({ email: '', message: '' });
      fetchConnections(); // Refresh list
    } catch (error) {
      console.error('Error adding connection:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete('/user/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success('Account deleted successfully. Redirecting...');
      
      // Redirect to landing page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  // Enhanced profile photo states
  const [avatarHistory, setAvatarHistory] = useState([]);
  const [selectedAvatarFrame, setSelectedAvatarFrame] = useState(null);
  const [avatarFilters, setAvatarFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const avatarFrames = [
    { id: 1, name: "Gold Crown", icon: Crown, color: "border-yellow-400" },
    { id: 2, name: "Silver Diamond", icon: Diamond, color: "border-gray-300" },
    { id: 3, name: "Blue Tech", icon: Code, color: "border-blue-500" },
    { id: 4, name: "Green Nature", icon: Sparkles, color: "border-green-500" },
    { id: 5, name: "Red Flame", icon: Flame, color: "border-red-500" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;

        // Map the user data to profile data format
        const mappedProfile = {
          firstName: userData.firstName || userData.name?.split(" ")[0] || "",
          lastName: userData.lastName || userData.name?.split(" ")[1] || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          country: userData.country || "",
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : "",
          gender: userData.gender || "",
          jobTitle: userData.jobTitle || userData.role || "",
          department: userData.department || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
          location: userData.city || userData.country || "",
        };

        setProfileData(mappedProfile);
        
        // Initialize avatar history with current avatar
        if (userData.avatar) {
          setAvatarHistory([userData.avatar]);
        }

        console.log('✅ Profile data loaded:', mappedProfile);
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        toast.error("Error fetching profile data.");
      }
    };

    fetchProfile();
    if (isAuthenticated) {
      fetchConnections();
    }
  }, [isAuthenticated, user]);

  // Real-time refresh for connections when tab is active
  useEffect(() => {
    if (activeTab === 'connections' && isAuthenticated) {
      fetchConnections();
      
      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(fetchConnections, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated]);

  // Fetch dynamic performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch data from multiple endpoints in parallel
        const [ordersRes, invoicesRes, teamRes, productsRes] = await Promise.allSettled([
          api.get('/orders', { headers }),
          api.get('/invoices', { headers }),
          api.get('/team', { headers }),
          api.get('/products', { headers })
        ]);

        // Extract data safely
        const orders = ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : []) : [];
        const invoices = invoicesRes.status === 'fulfilled' ? (Array.isArray(invoicesRes.value?.data) ? invoicesRes.value.data : []) : [];
        const team = teamRes.status === 'fulfilled' ? (Array.isArray(teamRes.value?.data) ? teamRes.value.data : []) : [];
        const products = productsRes.status === 'fulfilled' ? (Array.isArray(productsRes.value?.data) ? productsRes.value.data : []) : [];

        // Calculate real revenue from orders
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = parseFloat(order.total || order.amount || 0);
          return sum + amount;
        }, 0);

        // Calculate real stats
        const totalOrders = orders.length;
        const teamMembers = team.length;
        const activeProjects = products.filter(p => p.status === 'active').length;

        // Calculate achievements based on real data
        const achievements = [
          { 
            id: 1, 
            title: "First Sale", 
            description: "Made your first sale", 
            earned: totalOrders > 0, 
            icon: "🎯", 
            date: totalOrders > 0 ? orders[0]?.createdAt : null, 
            type: "sales" 
          },
          { 
            id: 2, 
            title: "Team Builder", 
            description: "Added 10+ team members", 
            earned: teamMembers >= 10, 
            icon: "👥", 
            date: teamMembers >= 10 ? new Date().toISOString() : null, 
            type: "team" 
          },
          { 
            id: 3, 
            title: "Revenue Milestone", 
            description: "Reached $10K revenue", 
            earned: totalRevenue >= 10000, 
            icon: "💰", 
            date: totalRevenue >= 10000 ? new Date().toISOString() : null, 
            type: "revenue" 
          },
          { 
            id: 4, 
            title: "Customer Champion", 
            description: "100+ satisfied customers", 
            earned: totalOrders >= 100, 
            icon: "⭐", 
            date: totalOrders >= 100 ? new Date().toISOString() : null, 
            type: "customer" 
          },
          { 
            id: 5, 
            title: "Innovation Leader", 
            description: "Launched 5+ products", 
            earned: products.length >= 5, 
            icon: "🚀", 
            date: products.length >= 5 ? new Date().toISOString() : null, 
            type: "innovation" 
          },
          { 
            id: 6, 
            title: "Community Builder", 
            description: "50+ orders completed", 
            earned: totalOrders >= 50, 
            icon: "🤝", 
            date: totalOrders >= 50 ? new Date().toISOString() : null, 
            type: "community" 
          },
        ];

        // Generate recent activity from ONLY real data
        const recentActivity = [
          ...orders.slice(0, 3).map((order, idx) => ({
            id: `order-${idx}`,
            action: `Created order #${order.orderNumber || order._id?.slice(-6)} - ${order.customerName || 'Customer'}`,
            timestamp: formatTimestamp(order.createdAt),
            type: 'order',
            icon: Package,
            color: 'text-blue-500',
            metadata: { amount: order.total || order.amount }
          })),
          ...invoices.slice(0, 2).map((invoice, idx) => ({
            id: `invoice-${idx}`,
            action: `Generated invoice #${invoice.invoiceNumber || invoice._id?.slice(-6)} - $${invoice.total || 0}`,
            timestamp: formatTimestamp(invoice.createdAt),
            type: 'finance',
            icon: DollarSign,
            color: 'text-green-500',
            metadata: { amount: invoice.total }
          })),
          ...team.slice(0, 2).map((member, idx) => ({
            id: `team-${idx}`,
            action: `Added team member: ${member.name || member.email}`,
            timestamp: formatTimestamp(member.createdAt),
            type: 'team',
            icon: Users,
            color: 'text-orange-500'
          })),
          ...products.filter(p => p.createdAt).slice(0, 2).map((product, idx) => ({
            id: `product-${idx}`,
            action: `Added product: ${product.name}`,
            timestamp: formatTimestamp(product.createdAt),
            type: 'product',
            icon: Package,
            color: 'text-purple-500'
          }))
        ].slice(0, 8);

        // ONLY set if we have real data
        setActivityData(recentActivity);

        const engagements = orders.length + invoices.length + team.length + products.length;
        const totalSales = orders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
        
        // Calculate rating from actual reviews if available
        const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
        const reviewedOrders = completedOrders.filter(o => o.rating);
        const averageRating = reviewedOrders.length > 0 
          ? reviewedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / reviewedOrders.length 
          : 0;

        // Update stats with ONLY real data
        setProfileStats({
          completionRate: getCompletionRate(),
          profileViews: 0, // Would need analytics API
          connections: team.length,
          totalOrders: totalOrders,
          totalRevenue: totalRevenue,
          activeProjects: activeProjects,
          teamMembers: teamMembers,
          rating: averageRating,
          reviewsCount: reviewedOrders.length,
          engagements: engagements,
          totalSales: totalSales,
          achievements: achievements
        });

        if (recentActivity.length > 0) {
          setActivityData(recentActivity);
        }

        console.log('✅ Performance data loaded:', {
          orders: totalOrders,
          revenue: totalRevenue,
          team: teamMembers,
          achievements: achievements.filter(a => a.earned).length
        });

      } catch (error) {
        console.error('❌ Error fetching performance data:', error);
        // Keep default values on error
      }
    };

    fetchPerformanceData();
  }, [isAuthenticated]);

  // Helper function to format timestamps
  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Filter out empty values to avoid validation errors
      const cleanedProfileData = { ...profileData };

      // Remove empty gender field to avoid enum validation error
      if (!cleanedProfileData.gender || cleanedProfileData.gender === '') {
        delete cleanedProfileData.gender;
      }

      // Remove other empty fields that might cause issues
      Object.keys(cleanedProfileData).forEach(key => {
        if (cleanedProfileData[key] === '') {
          delete cleanedProfileData[key];
        }
      });

      await api.put("/user/profile", cleanedProfileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  // Enhanced avatar upload with multiple options
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview for editing
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setAvatarPreview(imageUrl);
        setShowAvatarEditor(true);
        
        // Add to avatar history
        setAvatarHistory(prev => [imageUrl, ...prev.slice(0, 4)]);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error processing image");
      console.error("Error processing image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarSave = () => {
    if (avatarPreview) {
      setProfileData({ ...profileData, avatar: avatarPreview });
      toast.success("Profile picture updated!");
      setShowAvatarEditor(false);
      setAvatarZoom(1);
      setAvatarRotation(0);
      setAvatarFilters({ brightness: 100, contrast: 100, saturation: 100 });
    }
  };

  const handleAvatarFromURL = async () => {
    const url = prompt("Enter image URL:");
    if (url) {
      try {
        setIsUploading(true);
        // Validate URL and load image
        const img = new Image();
        img.onload = () => {
          setAvatarPreview(url);
          setShowAvatarEditor(true);
          setAvatarHistory(prev => [url, ...prev.slice(0, 4)]);
        };
        img.onerror = () => toast.error("Invalid image URL");
        img.src = url;
      } catch (error) {
        toast.error("Error loading image from URL");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, coverImage: e.target.result });
        toast.success("Cover image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfileData({ ...profileData, avatar: "" });
    setAvatarPreview("");
    toast.success("Profile picture removed");
  };

  const restorePreviousAvatar = (avatarUrl) => {
    setProfileData({ ...profileData, avatar: avatarUrl });
    toast.success("Previous profile picture restored");
  };

  // Avatar editor functions
  const rotateAvatar = () => {
    setAvatarRotation((prev) => (prev + 90) % 360);
  };

  const zoomAvatar = (direction) => {
    setAvatarZoom(prev => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };

  const applyAvatarFilter = (filter, value) => {
    setAvatarFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const addSkill = (skillName, level = 50) => {
    if (skillName && !skillsData.find(skill => skill.name.toLowerCase() === skillName.toLowerCase())) {
      setSkillsData([...skillsData, {
        name: skillName,
        level,
        category: "Other"
      }]);
      toast.success(`Added skill: ${skillName}`);
    }
  };

  const removeSkill = (skillName) => {
    setSkillsData(skillsData.filter(skill => skill.name !== skillName));
    toast.success(`Removed skill: ${skillName}`);
  };

  const updateSkillLevel = (skillName, newLevel) => {
    setSkillsData(skillsData.map(skill =>
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    ));
  };

  const generateQRCode = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;
  };

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  };

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.firstName} ${profileData.lastName}'s Profile`,
          text: `Check out my profile on ominbiz`,
          url: profileUrl,
        });
      } catch (error) {
        copyProfileLink();
      }
    } else {
      copyProfileLink();
    }
  };

  const exportProfile = () => {
    const profileExport = {
      ...profileData,
      stats: profileStats,
      preferences,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(profileExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profileData.firstName}_${profileData.lastName}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Profile exported successfully!");
  };

  // New feature: Download profile as image
  const downloadProfileAsImage = async () => {
    toast.info("This feature would generate a profile card image");
    // Implementation would require html2canvas or similar library
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCompletionRate = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.bio,
      profileData.jobTitle,
      profileData.avatar,
      profileData.location,
    ];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        {profileData.coverImage && (
          <img
            src={profileData.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {/* Cover Image Upload */}
        {isEditing && (
          <div className="absolute top-4 right-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              id="cover-upload"
              ref={coverInputRef}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          </div>
        )}

        {/* Profile Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-6">
            {/* Enhanced Avatar Section */}
            <div className="relative group">
              <div className={`relative rounded-full p-1 ${
                selectedAvatarFrame ? selectedAvatarFrame.color : 'border-4 border-white/20'
              }`}>
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={profileData.avatar} 
                    alt={`${profileData.firstName} ${profileData.lastName}`} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Enhanced Avatar Upload Options */}
                {isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem onClick={() => avatarInputRef.current?.click()}>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Upload Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAvatarFromURL}>
                        <Link className="h-4 w-4 mr-2" />
                        From URL
                      </DropdownMenuItem>
                      {profileData.avatar && (
                        <DropdownMenuItem onClick={removeAvatar}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Photo
                        </DropdownMenuItem>
                      )}
                      {avatarHistory.length > 0 && (
                        <DropdownMenuItem onClick={() => setShowAvatarEditor(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Photo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Availability Indicator */}
              <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-white ${getAvailabilityColor(profileData.availability)}`} />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                {profileData.pronouns && (
                  <Badge variant="secondary" className="text-xs">
                    {profileData.pronouns}
                  </Badge>
                )}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(profileData.availability)} text-white`}>
                  {getAvailabilityText(profileData.availability)}
                </div>
                <OnlineStatusIndicator showBadge={true} className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full" />
              </div>

              <div className="flex items-center gap-4 text-sm opacity-90 mb-3">
                {profileData.jobTitle && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profileData.jobTitle}
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {profileStats.rating} ({profileStats.reviewsCount} reviews)
                </div>
              </div>

              {profileData.bio && (
                <p className="text-sm opacity-90 max-w-2xl">
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button variant="secondary" size="sm" onClick={shareProfile}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowQRCode(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
        ref={avatarInputRef}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview - Real-Time Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{profileStats.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">From orders API</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${profileStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Calculated from orders</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagements</p>
                <p className="text-2xl font-bold">{profileStats.engagements.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders + Invoices + Team + Products</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Sales</p>
                <p className="text-2xl font-bold">{profileStats.totalSales.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Delivered orders</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </Card>
        </div>

        {/* Additional Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                <p className="text-2xl font-bold">{profileStats.teamMembers}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{profileStats.activeProjects}</p>
              </div>
              <Briefcase className="h-8 w-8 text-indigo-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{profileStats.rating ? profileStats.rating.toFixed(1) : '0.0'}</p>
                <p className="text-xs text-muted-foreground mt-1">{profileStats.reviewsCount} reviews</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Progress</p>
                <p className="text-2xl font-bold">{getCompletionRate()}%</p>
              </div>
              <Target className="h-8 w-8 text-pink-500" />
            </div>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="connections">Network</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Profile Completion
                    </CardTitle>
                    <CardDescription>
                      Complete your profile to get better visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{getCompletionRate()}%</span>
                      </div>
                      <Progress value={getCompletionRate()} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${profileData.avatar ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Profile Picture</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${profileData.bio ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Bio</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${profileData.jobTitle ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Job Title</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`h-4 w-4 ${profileData.location ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className="text-sm">Location</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>
                      Your milestones and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {profileStats.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            achievement.earned
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                              : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              {achievement.earned && achievement.date && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Earned {new Date(achievement.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {achievement.earned && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Your latest actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {activityData.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${activity.color} bg-opacity-10`}>
                              <activity.icon className={`h-4 w-4 ${activity.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={copyProfileLink}>
                      <Link className="h-4 w-4 mr-2" />
                      Copy Profile Link
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={exportProfile}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowQRCode(true)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={downloadProfileAsImage}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Save as Image
                    </Button>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Social Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.website && (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {profileData.github && (
                      <a href={profileData.github} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {profileData.twitter && (
                      <a href={profileData.twitter} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Twitter className="h-4 w-4" />
                        Twitter
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Profile Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Orders</span>
                      <span className="font-medium">{profileStats.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-medium">${profileStats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Projects</span>
                      <span className="font-medium">{profileStats.activeProjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Team Members</span>
                      <span className="font-medium">{profileStats.teamMembers}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{profileData.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{profileData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Job Title</p>
                        <p className="text-sm text-muted-foreground">{profileData.jobTitle || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{profileData.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Skills & Expertise</CardTitle>
                    <CardDescription>Your professional skills and proficiency levels</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const skill = prompt('Enter skill name:');
                      if (skill) addSkill(skill, 50);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillsData.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{skill.level}%</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.name)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={skill.level} className="h-2 flex-1" />
                        <Slider
                          value={[skill.level]}
                          onValueChange={([value]) => updateSkillLevel(skill.name, value)}
                          max={100}
                          step={5}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activityData.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full ${activity.color} bg-opacity-10`}>
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground mt-1">{activity.timestamp}</p>
                          <Badge variant="outline" className="mt-2 text-xs">{activity.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Network & Connections</CardTitle>
                    <CardDescription>
                      {connectionsData.length} connections
                      {loadingConnections && " • Refreshing..."}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchConnections}
                      disabled={loadingConnections}
                    >
                      <RotateCw className={`h-4 w-4 mr-2 ${loadingConnections ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowAddConnectionDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Connection
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingConnections && connectionsData.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RotateCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Loading connections...</p>
                    </div>
                  </div>
                ) : connectionsData.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-1">No connections yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start building your network</p>
                      <Button size="sm" onClick={() => setShowAddConnectionDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Your First Connection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectionsData.map((connection) => (
                      <Card key={connection.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={connection.avatar} />
                            <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{connection.name}</h4>
                            <p className="text-xs text-muted-foreground">{connection.role}</p>
                            {connection.email && (
                              <p className="text-xs text-muted-foreground">{connection.email}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {connection.mutual} mutual connection{connection.mutual !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant={connection.connected ? "outline" : "default"}
                              size="sm"
                              onClick={() => connection.connected ? handleDisconnect(connection.id) : handleConnect(connection.id)}
                            >
                              {connection.connected ? 'Connected' : 'Connect'}
                            </Button>
                            {connection.connected && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDisconnect(connection.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Connection
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Connection Dialog */}
          <Dialog open={showAddConnectionDialog} onOpenChange={setShowAddConnectionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Connection</DialogTitle>
                <DialogDescription>
                  Send a connection invitation to someone via email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="connection-email">Email Address</Label>
                  <Input
                    id="connection-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={newConnection.email}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="connection-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="connection-message"
                    placeholder="I'd like to connect with you..."
                    value={newConnection.message}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddConnectionDialog(false);
                    setNewConnection({ email: '', message: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddConnection}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your privacy and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => {
                        setPreferences({...preferences, emailNotifications: checked});
                        toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => {
                        setPreferences({...preferences, pushNotifications: checked});
                        toast.success(`Push notifications ${checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label>Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                    </div>
                    <Switch
                      checked={preferences.showActivity}
                      onCheckedChange={(checked) => {
                        setPreferences({...preferences, showActivity: checked});
                        toast.success(`Activity status ${checked ? 'visible' : 'hidden'}`);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select
                      value={preferences.profileVisibility}
                      onValueChange={(value) => {
                        setPreferences({...preferences, profileVisibility: value});
                        toast.success(`Profile visibility set to ${value}`);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="connections">Connections</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">Irreversible actions</p>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setShowDeleteAccountDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
            <DialogDescription>
              Share your profile with others using this QR code
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <img
                src={generateQRCode()}
                alt="Profile QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyProfileLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={shareProfile}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="allow-select"
              />
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">Warning:</p>
              <ul className="text-xs text-red-700 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
                <li>All your profile data will be deleted</li>
                <li>All your orders and transactions will be removed</li>
                <li>All your products and inventory will be deleted</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteAccountDialog(false);
                setDeleteConfirmText('');
              }}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
            >
              {isDeletingAccount ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Avatar Editor Dialog */}
      <Dialog open={showAvatarEditor} onOpenChange={setShowAvatarEditor}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust and customize your profile picture
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="max-h-56 max-w-56 rounded-full object-cover transition-all"
                    style={{
                      transform: `scale(${avatarZoom}) rotate(${avatarRotation}deg)`,
                      filter: `brightness(${avatarFilters.brightness}%) contrast(${avatarFilters.contrast}%) saturate(${avatarFilters.saturation}%)`
                    }}
                  />
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-center space-x-2">
                <Button variant="outline" size="sm" onClick={rotateAvatar}>
                  <RotateCw className="h-4 w-4 mr-1" />
                  Rotate
                </Button>
                <Button variant="outline" size="sm" onClick={() => zoomAvatar('in')}>
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom In
                </Button>
                <Button variant="outline" size="sm" onClick={() => zoomAvatar('out')}>
                  <ZoomOut className="h-4 w-4 mr-1" />
                  Zoom Out
                </Button>
              </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="space-y-3">
                <Label>Brightness</Label>
                <Slider
                  value={[avatarFilters.brightness]}
                  onValueChange={([value]) => applyAvatarFilter('brightness', value)}
                  max={200}
                  step={1}
                />
                
                <Label>Contrast</Label>
                <Slider
                  value={[avatarFilters.contrast]}
                  onValueChange={([value]) => applyAvatarFilter('contrast', value)}
                  max={200}
                  step={1}
                />
                
                <Label>Saturation</Label>
                <Slider
                  value={[avatarFilters.saturation]}
                  onValueChange={([value]) => applyAvatarFilter('saturation', value)}
                  max={200}
                  step={1}
                />
              </div>

              {/* Avatar Frames */}
              <div className="space-y-2">
                <Label>Avatar Frames</Label>
                <div className="flex space-x-2">
                  {avatarFrames.map((frame) => (
                    <Button
                      key={frame.id}
                      variant="outline"
                      size="sm"
                      className={`p-2 ${selectedAvatarFrame?.id === frame.id ? 'border-2 border-primary' : ''}`}
                      onClick={() => setSelectedAvatarFrame(frame)}
                    >
                      <frame.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Avatar History */}
              {avatarHistory.length > 0 && (
                <div className="space-y-2">
                  <Label>Recent Photos</Label>
                  <div className="flex space-x-2">
                    {avatarHistory.slice(0, 4).map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt={`Previous ${index + 1}`}
                        className="h-12 w-12 rounded-full object-cover cursor-pointer border-2 hover:border-primary transition-colors"
                        onClick={() => setAvatarPreview(avatar)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleAvatarSave} disabled={isUploading}>
              {isUploading ? (
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;