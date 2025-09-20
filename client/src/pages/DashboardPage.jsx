import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Bell,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'

function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Products Sold',
      value: '12,234',
      change: '+7.2%',
      trend: 'up',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const recentOrders = [
    { id: '#3210', customer: 'John Doe', amount: '$250.00', status: 'completed', date: '2 hours ago' },
    { id: '#3209', customer: 'Jane Smith', amount: '$180.50', status: 'pending', date: '4 hours ago' },
    { id: '#3208', customer: 'Mike Johnson', amount: '$320.75', status: 'completed', date: '6 hours ago' },
    { id: '#3207', customer: 'Sarah Wilson', amount: '$95.25', status: 'processing', date: '8 hours ago' },
    { id: '#3206', customer: 'Tom Brown', amount: '$420.00', status: 'completed', date: '1 day ago' }
  ]

  const quickActions = [
    { title: 'Add Product', icon: Plus, href: '/products', color: 'bg-blue-500' },
    { title: 'View Orders', icon: Eye, href: '/orders', color: 'bg-green-500' },
    { title: 'Manage Inventory', icon: Package, href: '/inventory', color: 'bg-purple-500' },
    { title: 'Schedule Meeting', icon: Calendar, href: '/appointments', color: 'bg-orange-500' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg border border-border hover:bg-accent">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <div key={index} className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>