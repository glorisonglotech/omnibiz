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
  Clock
} from 'lucide-react'

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
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
    timezone: 'EST (UTC-5)'
  })

  const [stats] = useState([
    { label: 'Projects Completed', value: '24', icon: Award },
    { label: 'Team Members', value: '12', icon: User },
    { label: 'Active Clients', value: '48', icon: Building },
    { label: 'Hours Logged', value: '1,240', icon: Clock }
  ])

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
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
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
      </div>
    </div>
  )
}

export default Profile