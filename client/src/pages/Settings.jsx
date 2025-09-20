import React, { useState } from 'react'
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

function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [darkMode, setDarkMode] = useState('system')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const settingsTabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
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
                    defaultValue="My Business"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Retail</option>
                    <option>Services</option>
                    <option>Manufacturing</option>
                    <option>Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>CAD (C$)</option>
                  </select>
                </div>
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
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
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
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Theme Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Color Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor }
                    ].map((theme) => {
                      const IconComponent = theme.icon
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setDarkMode(theme.id)}
                          className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            darkMode === theme.id
                              ? 'border-primary bg-primary/5'
                              : 'border-input hover:bg-accent'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 text-foreground" />
                          <span className="text-sm font-medium text-foreground">{theme.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Accent Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: 'Blue', color: 'bg-blue-500' },
                      { name: 'Green', color: 'bg-green-500' },
                      { name: 'Purple', color: 'bg-purple-500' },
                      { name: 'Orange', color: 'bg-orange-500' },
                      { name: 'Red', color: 'bg-red-500' },
                      { name: 'Pink', color: 'bg-pink-500' }
                    ].map((color) => (
                      <button
                        key={color.name}
                        className={`w-8 h-8 rounded-full ${color.color} border-2 border-transparent hover:border-foreground transition-colors`}
                        title={color.name}
                      />
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Billing Information</h3>
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">$29</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="text-foreground">January 15, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="text-foreground">•••• •••• •••• 4242</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 mb-2">
                  Upgrade Plan
                </button>
                <button className="w-full border border-input py-2 px-4 rounded-md text-foreground hover:bg-accent">
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                <div className="p-4 border border-input rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Data Export</h4>
                  <p className="text-sm text-muted-foreground mb-3">Download all your data in a portable format</p>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90">
                    Request Data Export
                  </button>
                </div>

                <div className="p-4 border border-input rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all data</p>
                  <button className="bg-destructive text-white px-4 py-2 rounded-md text-sm hover:bg-destructive/90">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Support & Help</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-input rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Documentation</h4>
                    <p className="text-sm text-muted-foreground mb-3">Browse our comprehensive guides</p>
                    <button className="text-primary hover:underline text-sm">View Docs</button>
                  </div>

                  <div className="p-4 border border-input rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-3">Get help from our support team</p>
                    <button className="text-primary hover:underline text-sm">Contact Us</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Select a settings category from the sidebar.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-card p-6 rounded-lg border">
              {renderTabContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-input rounded-md text-foreground hover:bg-accent">
                    Cancel
                  </button>
                  <button className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings