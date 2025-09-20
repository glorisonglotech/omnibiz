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