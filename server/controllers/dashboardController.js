const dashboardAnalytics = require('../services/dashboardAnalytics');
const { activityLogger } = require('../services/activityLogger');

// @desc    Get role-specific dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const { user } = req;
    const { timeframe = '30d' } = req.query;

    let dashboardData;

    // Log dashboard view
    await activityLogger.logDashboardView(user._id, `${user.role}_dashboard`, req);

    switch (user.role) {
      case 'super_admin':
      case 'admin':
        dashboardData = await dashboardAnalytics.getAdminDashboard(user._id, timeframe);
        break;
      
      case 'client':
        dashboardData = await dashboardAnalytics.getClientDashboard(user._id, timeframe);
        break;
      
      case 'manager':
      case 'staff':
        dashboardData = await dashboardAnalytics.getStaffDashboard(user._id, timeframe);
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid user role for dashboard access' });
    }

    res.json({
      success: true,
      data: dashboardData,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      },
      timeframe,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message 
    });
  }
};

// @desc    Get dashboard analytics for specific metric
// @route   GET /api/dashboard/analytics/:metric
// @access  Private
const getSpecificAnalytics = async (req, res) => {
  try {
    const { user } = req;
    const { metric } = req.params;
    const { timeframe = '30d', ...filters } = req.query;

    let analyticsData;

    switch (metric) {
      case 'orders':
        if (user.role === 'client') {
          const dateRange = dashboardAnalytics.getDateRange(timeframe);
          analyticsData = await dashboardAnalytics.getClientOrders(user._id, dateRange);
        } else {
          const dateRange = dashboardAnalytics.getDateRange(timeframe);
          analyticsData = await dashboardAnalytics.getTotalOrders(dateRange);
        }
        break;

      case 'revenue':
        if (user.role === 'client') {
          const dateRange = dashboardAnalytics.getDateRange(timeframe);
          analyticsData = await dashboardAnalytics.getClientSpendingTrends(user._id, dateRange);
        } else {
          const dateRange = dashboardAnalytics.getDateRange(timeframe);
          analyticsData = await dashboardAnalytics.getRevenueTrends(dateRange);
        }
        break;

      case 'activities':
        if (user.role === 'client') {
          const dateRange = dashboardAnalytics.getDateRange(timeframe);
          analyticsData = await dashboardAnalytics.getClientActivities(user._id, dateRange);
        } else {
          analyticsData = await dashboardAnalytics.getRecentActivities(20);
        }
        break;

      case 'users':
        if (!['admin', 'super_admin'].includes(user.role)) {
          return res.status(403).json({ message: 'Access denied' });
        }
        const dateRange = dashboardAnalytics.getDateRange(timeframe);
        analyticsData = await dashboardAnalytics.getUserGrowthTrends(dateRange);
        break;

      case 'top-clients':
        if (!['admin', 'super_admin', 'manager'].includes(user.role)) {
          return res.status(403).json({ message: 'Access denied' });
        }
        const clientDateRange = dashboardAnalytics.getDateRange(timeframe);
        analyticsData = await dashboardAnalytics.getTopClients(clientDateRange);
        break;

      default:
        return res.status(400).json({ message: 'Invalid analytics metric' });
    }

    // Log analytics view
    await activityLogger.logActivity({
      userId: user._id,
      action: 'dashboard_viewed',
      category: 'system',
      description: `Viewed ${metric} analytics`,
      metadata: {
        metric,
        timeframe,
        filters
      }
    }, req);

    res.json({
      success: true,
      metric,
      data: analyticsData,
      timeframe,
      filters,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching specific analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message 
    });
  }
};

// @desc    Get real-time dashboard updates
// @route   GET /api/dashboard/realtime
// @access  Private
const getRealtimeUpdates = async (req, res) => {
  try {
    const { user } = req;
    const { lastUpdate } = req.query;

    const since = lastUpdate ? new Date(lastUpdate) : new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

    // Get recent activities since last update
    const recentActivities = await dashboardAnalytics.getRecentActivities(10);
    const filteredActivities = recentActivities.filter(activity => 
      new Date(activity.timestamp) > since
    );

    // Get role-specific real-time data
    let realtimeData = {
      activities: filteredActivities,
      timestamp: new Date()
    };

    if (['admin', 'super_admin'].includes(user.role)) {
      // Admin real-time data
      const systemHealth = await dashboardAnalytics.getSystemHealth();
      realtimeData.systemHealth = systemHealth;
      
      // Recent orders and service requests
      const dateRange = dashboardAnalytics.getDateRange('24h');
      const [recentOrders, recentServiceRequests] = await Promise.all([
        dashboardAnalytics.getTotalOrders(dateRange),
        dashboardAnalytics.getTotalServiceRequests(dateRange)
      ]);
      
      realtimeData.recentMetrics = {
        orders: recentOrders,
        serviceRequests: recentServiceRequests
      };
    } else if (user.role === 'client') {
      // Client real-time data
      const dateRange = dashboardAnalytics.getDateRange('24h');
      const [myOrders, myServiceRequests] = await Promise.all([
        dashboardAnalytics.getClientOrders(user._id, dateRange),
        dashboardAnalytics.getClientServiceRequests(user._id, dateRange)
      ]);
      
      realtimeData.myMetrics = {
        orders: myOrders,
        serviceRequests: myServiceRequests
      };
    }

    res.json({
      success: true,
      data: realtimeData,
      hasUpdates: filteredActivities.length > 0
    });
  } catch (error) {
    console.error('Error fetching real-time updates:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch real-time updates',
      error: error.message 
    });
  }
};

// @desc    Get dashboard summary for quick overview
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const { user } = req;
    const { timeframe = '7d' } = req.query;

    const dateRange = dashboardAnalytics.getDateRange(timeframe);
    let summary;

    if (['admin', 'super_admin'].includes(user.role)) {
      const [
        totalOrders,
        totalRevenue,
        totalUsers,
        systemHealth
      ] = await Promise.all([
        dashboardAnalytics.getTotalOrders(dateRange),
        dashboardAnalytics.getTotalRevenue(dateRange),
        dashboardAnalytics.getTotalUsers(dateRange),
        dashboardAnalytics.getSystemHealth()
      ]);

      summary = {
        orders: {
          total: totalOrders.count,
          pending: totalOrders.pending,
          completed: totalOrders.completed
        },
        revenue: {
          total: totalRevenue.total,
          orderCount: totalRevenue.count
        },
        users: {
          total: totalUsers.count,
          clients: totalUsers.clients,
          admins: totalUsers.admins
        },
        system: {
          status: systemHealth.status,
          activeUsers: systemHealth.activeUsers,
          errorRate: systemHealth.errorRate
        }
      };
    } else if (user.role === 'client') {
      const [
        myOrders,
        myServiceRequests,
        myTransactions
      ] = await Promise.all([
        dashboardAnalytics.getClientOrders(user._id, dateRange),
        dashboardAnalytics.getClientServiceRequests(user._id, dateRange),
        dashboardAnalytics.getClientTransactions(user._id, dateRange)
      ]);

      summary = {
        orders: {
          total: myOrders.total,
          pending: myOrders.pending,
          completed: myOrders.completed,
          totalValue: myOrders.totalValue
        },
        serviceRequests: {
          total: myServiceRequests.total,
          active: myServiceRequests.active,
          completed: myServiceRequests.completed
        },
        spending: {
          total: myTransactions.totalSpent,
          transactions: myTransactions.transactionCount
        }
      };
    }

    res.json({
      success: true,
      summary,
      timeframe,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message 
    });
  }
};

// @desc    Clear dashboard cache
// @route   POST /api/dashboard/clear-cache
// @access  Private (Admin)
const clearDashboardCache = async (req, res) => {
  try {
    const { user } = req;

    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clear the analytics cache
    dashboardAnalytics.cache.clear();

    // Log cache clear activity
    await activityLogger.logActivity({
      userId: user._id,
      action: 'system_maintenance',
      category: 'system',
      description: 'Cleared dashboard analytics cache',
      riskLevel: 'medium'
    }, req);

    res.json({
      success: true,
      message: 'Dashboard cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing dashboard cache:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to clear dashboard cache',
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardData,
  getSpecificAnalytics,
  getRealtimeUpdates,
  getDashboardSummary,
  clearDashboardCache
};
