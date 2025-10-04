import React, { useState, useEffect } from 'react'
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Database,
  HelpCircle,
  Save,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAppTheme } from '@/context/ThemeContext'
import api from '@/lib/api'
import { toast } from 'sonner'

function Settings() {
  const { user, isAuthenticated } = useAuth()
  const { theme, setTheme, availableThemes } = useAppTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'retail',
    timezone: 'UTC-5',
    currency: 'USD',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const settingsTabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  // Load user settings on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        businessName: user.businessName || '',
      }))
    }
  }, [isAuthenticated, user])

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveGeneral = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save settings')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.put('/user/profile', {
        businessName: formData.businessName,
        industry: formData.industry,
        timezone: formData.timezone,
        currency: formData.currency
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('General settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save general settings')
      console.error('Error saving general settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save settings')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.put('/user/settings', {
        section: 'notifications',
        settings: notifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save notification settings')
      console.error('Error saving notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await api.put('/user/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Password changed successfully!')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      toast.error('Failed to change password')
      console.error('Error changing password:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="technology">Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Time Zone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    <option value="UTC-6">UTC-6 (Central Time)</option>
                    <option value="UTC-7">UTC-7 (Mountain Time)</option>
                    <option value="UTC-8">UTC-8 (Pacific Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSaveGeneral}
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', icon: Bell, description: 'Browser and mobile notifications' },
                  { key: 'sms', label: 'SMS Notifications', icon: Smartphone, description: 'Text message alerts' },
                  { key: 'marketing', label: 'Marketing Communications', icon: Globe, description: 'Product updates and promotions' }
                ].map((item) => {
                  const IconComponent = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-input rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={() => handleNotificationChange(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-input rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-input rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info('Two-factor authentication setup coming soon!')}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-input rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Theme</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(availableThemes).map(([key, themeData]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          theme === key
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-full h-8 rounded mb-2 ${themeData.preview}`}></div>
                        <p className="text-sm font-medium">{themeData.name}</p>
                        <p className="text-xs text-muted-foreground">{themeData.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Billing & Subscription</h3>

              {/* Current Plan */}
              <div className="p-6 border border-input rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-foreground">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">Free Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">$0</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Up to 100 products</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Basic inventory management</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Email support</span>
                  </div>
                </div>

                <button
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => toast.info('Upgrade options will be available soon!')}
                >
                  Upgrade Plan
                </button>
              </div>

              {/* Billing History */}
              <div className="p-6 border border-input rounded-lg bg-card">
                <h4 className="text-lg font-medium text-foreground mb-4">Billing History</h4>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No billing history available</p>
                  <p className="text-sm text-muted-foreground">You're currently on the free plan</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Data & Privacy</h3>

              {/* Data Collection */}
              <div className="p-6 border border-input rounded-lg bg-card space-y-4">
                <h4 className="text-lg font-medium text-foreground">Data Collection</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Analytics & Usage Data</p>
                      <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={true}
                        onChange={(e) => {
                          if (e.target.checked) {
                            toast.success('Analytics enabled')
                          } else {
                            toast.success('Analytics disabled')
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            toast.success('Marketing communications enabled')
                          } else {
                            toast.success('Marketing communications disabled')
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="p-6 border border-input rounded-lg bg-card">
                <h4 className="text-lg font-medium text-foreground mb-4">Data Export</h4>
                <p className="text-sm text-muted-foreground mb-4">Download a copy of your data</p>
                <button
                  className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => toast.success('Data export initiated. You will receive an email when ready.')}
                >
                  <Database className="w-4 h-4 mr-2 inline" />
                  Export My Data
                </button>
              </div>

              {/* Account Deletion */}
              <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
                <h4 className="text-lg font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data</p>
                <button
                  className="bg-destructive text-destructive-foreground py-2 px-4 rounded-md hover:bg-destructive/90 transition-colors"
                  onClick={() => toast.error('Account deletion requires email confirmation. Feature will be available soon.')}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Support & Help</h3>

              {/* Contact Support */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-6 border border-input rounded-lg bg-card">
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 text-primary mr-3" />
                    <h4 className="text-lg font-medium text-foreground">Email Support</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Get help via email within 24 hours</p>
                  <button
                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      window.location.href = 'mailto:support@omnibiz.com?subject=Support Request'
                      toast.success('Opening email client...')
                    }}
                  >
                    Send Email
                  </button>
                </div>

                <div className="p-6 border border-input rounded-lg bg-card">
                  <div className="flex items-center mb-4">
                    <HelpCircle className="h-6 w-6 text-primary mr-3" />
                    <h4 className="text-lg font-medium text-foreground">Help Center</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Browse our knowledge base and FAQs</p>
                  <button
                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      window.open('/help', '_blank')
                      toast.success('Opening help center...')
                    }}
                  >
                    Visit Help Center
                  </button>
                </div>
              </div>

              {/* System Information */}
              <div className="p-6 border border-input rounded-lg bg-card">
                <h4 className="text-lg font-medium text-foreground mb-4">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium text-foreground">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Browser</p>
                    <p className="font-medium text-foreground">{navigator.userAgent.split(' ')[0]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Platform</p>
                    <p className="font-medium text-foreground">{navigator.platform}</p>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="p-6 border border-input rounded-lg bg-card">
                <h4 className="text-lg font-medium text-foreground mb-4">Send Feedback</h4>
                <p className="text-sm text-muted-foreground mb-4">Help us improve OmniBiz by sharing your thoughts</p>
                <div className="space-y-3">
                  <textarea
                    className="w-full p-3 border border-input rounded-md bg-background text-foreground resize-none"
                    rows="4"
                    placeholder="Tell us what you think..."
                  />
                  <button
                    className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => toast.success('Thank you for your feedback! We\'ll review it soon.')}
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <div className="bg-card border border-input rounded-lg p-4">
              <nav className="space-y-2">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-card border border-input rounded-lg p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings