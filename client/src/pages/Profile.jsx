import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Building,
  Globe,
  Shield,
  Award,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Activity,
  Settings,
  Bell,
  Download,
  Upload,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@omnibiz.com',
    phone: '+1 (555) 123-4567',
    company: 'OmniBiz Solutions',
    position: 'Business Manager',
    location: 'New York, NY',
    website: 'https://omnibiz.com',
    bio: 'Experienced business manager with over 8 years in operations and team leadership. Passionate about streamlining processes and driving growth.',
    joinDate: 'January 2023',
    timezone: 'EST (UTC-5)',
    department: 'Operations',
    employeeId: 'EMP-2023-001',
    manager: 'Sarah Johnson',
    skills: ['Project Management', 'Team Leadership', 'Business Analysis', 'Strategic Planning'],
    certifications: ['PMP Certified', 'Agile Scrum Master', 'Six Sigma Green Belt']
  })

  const [stats] = useState([
    { label: 'Total Revenue', value: '$124,500', icon: DollarSign, change: '+12%', color: 'text-green-600' },
    { label: 'Active Projects', value: '24', icon: Package, change: '+3', color: 'text-blue-600' },
    { label: 'Team Members', value: '12', icon: Users, change: '+2', color: 'text-purple-600' },
    { label: 'Performance Score', value: '94%', icon: TrendingUp, change: '+5%', color: 'text-orange-600' }
  ])

  const [recentActivity] = useState([
    { action: 'Completed project "Website Redesign"', time: '2 hours ago', type: 'success' },
    { action: 'Updated team meeting schedule', time: '4 hours ago', type: 'info' },
    { action: 'Reviewed quarterly reports', time: '1 day ago', type: 'info' },
    { action: 'Approved budget proposal', time: '2 days ago', type: 'success' },
    { action: 'Meeting with client delayed', time: '3 days ago', type: 'warning' }
  ])

  const [socialLinks] = useState([
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', icon: Linkedin },
    { platform: 'Twitter', url: 'https://twitter.com/johndoe', icon: Twitter },
    { platform: 'GitHub', url: 'https://github.com/johndoe', icon: Github }
  ])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
    console.log('Profile updated:', profileData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original data if needed
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <Camera className="w-4 h-4 text-primary" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-1">{profileData.position}</p>
              <p className="text-sm text-muted-foreground mb-3">{profileData.company} • {profileData.location}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {profileData.joinDate}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profileData.timezone}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="bg-card p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color === 'text-green-600' ? 'bg-green-100' : stat.color === 'text-blue-600' ? 'bg-blue-100' : stat.color === 'text-purple-600' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                        <IconComponent className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg border">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-foreground mt-4">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-muted-foreground">{profileData.position}</p>
                <p className="text-sm text-muted-foreground">{profileData.company}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {profileData.joinDate}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Shield className="w-4 h-4 mr-2" />
                    Verified Account
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 border border-input px-3 py-1 rounded-md text-sm hover:bg-accent"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.phone}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.company}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Award className="w-4 h-4 inline mr-2" />
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.position}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <p className="text-foreground">{profileData.location}</p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profileData.website}
                    </a>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-foreground">{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive email updates about your account</p>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Data Export</p>
                  <p className="text-xs text-muted-foreground">Download your account data</p>
                </div>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Profile