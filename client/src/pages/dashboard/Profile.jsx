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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Diamond
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import api from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, customAccentColor } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQRCode, setShowQRCode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const fileInputRef = useRef(null);

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
    completionRate: 85,
    profileViews: 1247,
    connections: 89,
    totalOrders: 156,
    totalRevenue: 45230,
    activeProjects: 8,
    teamMembers: 12,
    rating: 4.8,
    reviewsCount: 23,
    achievements: [
      { id: 1, title: "First Sale", description: "Made your first sale", earned: true, icon: "🎯", date: "2024-01-15" },
      { id: 2, title: "Team Builder", description: "Added 10+ team members", earned: true, icon: "👥", date: "2024-02-20" },
      { id: 3, title: "Revenue Milestone", description: "Reached $10K revenue", earned: true, icon: "💰", date: "2024-03-10" },
      { id: 4, title: "Customer Champion", description: "100+ satisfied customers", earned: false, icon: "⭐", date: null },
      { id: 5, title: "Innovation Leader", description: "Launched 5+ new features", earned: true, icon: "🚀", date: "2024-04-05" },
      { id: 6, title: "Community Builder", description: "Helped 50+ users", earned: false, icon: "🤝", date: null },
    ]
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

  const [activityData, setActivityData] = useState([
    {
      id: 1,
      action: "Updated inventory for Product A",
      timestamp: "2 hours ago",
      type: "inventory",
      icon: Package,
      color: "text-blue-500",
    },
    {
      id: 2,
      action: "Created new invoice #INV-001",
      timestamp: "5 hours ago",
      type: "finance",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      id: 3,
      action: "Scheduled appointment with John Doe",
      timestamp: "1 day ago",
      type: "appointment",
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      id: 4,
      action: "Added new team member",
      timestamp: "2 days ago",
      type: "team",
      icon: Users,
      color: "text-orange-500",
    },
    {
      id: 5,
      action: "Completed project milestone",
      timestamp: "3 days ago",
      type: "project",
      icon: Target,
      color: "text-red-500",
    },
    {
      id: 6,
      action: "Updated profile information",
      timestamp: "1 week ago",
      type: "profile",
      icon: User,
      color: "text-indigo-500",
    },
  ]);

  const [skillsData, setSkillsData] = useState([
    { name: "JavaScript", level: 90, category: "Programming" },
    { name: "React", level: 85, category: "Frontend" },
    { name: "Node.js", level: 80, category: "Backend" },
    { name: "Python", level: 75, category: "Programming" },
    { name: "UI/UX Design", level: 70, category: "Design" },
    { name: "Project Management", level: 85, category: "Management" },
  ]);

  const [connectionsData, setConnectionsData] = useState([
    { id: 1, name: "Sarah Johnson", role: "Product Manager", avatar: "", mutual: 12, connected: true },
    { id: 2, name: "Mike Chen", role: "Developer", avatar: "", mutual: 8, connected: true },
    { id: 3, name: "Emily Davis", role: "Designer", avatar: "", mutual: 15, connected: false },
    { id: 4, name: "Alex Rodriguez", role: "Marketing Lead", avatar: "", mutual: 6, connected: true },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view profile.");
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
          jobTitle: userData.jobTitle || "",
          department: userData.department || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
        };

        setProfileData(mappedProfile);
      } catch (error) {
        toast.error("Error fetching profile data.");
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put("/user/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result });
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
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
          text: `Check out my profile on OmniBiz`,
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
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById('cover-upload')?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          </div>
        )}

        {/* Profile Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.avatar} alt={`${profileData.firstName} ${profileData.lastName}`} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              {/* Availability Indicator */}
              <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-white ${getAvailabilityColor(profileData.availability)}`} />

              {/* Avatar Upload */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
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
        ref={fileInputRef}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{profileStats.profileViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">{profileStats.connections}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{getCompletionRate()}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{profileStats.rating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 fill-current" />
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
    </div>
  );
};

export default Profile;
