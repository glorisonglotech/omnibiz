const User = require('../models/user');
const Order = require('../models/order');
const ServiceRequest = require('../models/serviceRequest');
const Transaction = require('../models/transaction');
const UserActivity = require('../models/userActivity');

class DashboardAnalytics {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or fetch new data
   */
  async getCachedData(key, fetchFunction, userId = null) {
    const cacheKey = userId ? `${key}_${userId}` : key;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    const data = await fetchFunction();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }

  /**
   * Get admin dashboard analytics
   */
  async getAdminDashboard(adminId, timeframe = '30d') {
    return this.getCachedData('admin_dashboard', async () => {
      const dateRange = this.getDateRange(timeframe);
      
      // Get overview statistics
      const [
        totalUsers,
        totalOrders,
        totalServiceRequests,
        totalRevenue,
        recentActivities,
        orderTrends,
        userGrowthTrends,
        topClients
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getTotalOrders(dateRange),
        this.getTotalServiceRequests(dateRange),
        this.getTotalRevenue(dateRange),
        this.getRecentActivities(10),
        this.getOrderTrends(dateRange),
        this.getUserGrowthTrends(dateRange),
        this.getTopClients(dateRange)
      ]);

      // Calculate growth rates
      const previousPeriod = this.getPreviousDateRange(timeframe);
      const [
        previousOrders,
        previousRevenue,
        previousUsers
      ] = await Promise.all([
        this.getTotalOrders(previousPeriod),
        this.getTotalRevenue(previousPeriod),
        this.getTotalUsers(previousPeriod)
      ]);

      const orderGrowth = this.calculateGrowthRate(totalOrders.count, previousOrders.count);
      const revenueGrowth = this.calculateGrowthRate(totalRevenue.total, previousRevenue.total);
      const userGrowth = this.calculateGrowthRate(totalUsers.count, previousUsers.count);

      return {
        overview: {
          totalUsers: totalUsers.count,
          totalOrders: totalOrders.count,
          totalServiceRequests: totalServiceRequests.count,
          totalRevenue: totalRevenue.total,
          pendingOrders: totalOrders.pending,
          activeServiceRequests: totalServiceRequests.active,
          growthRates: {
            orders: orderGrowth,
            revenue: revenueGrowth,
            users: userGrowth
          }
        },
        trends: {
          orders: orderTrends,
          userGrowth: userGrowthTrends,
          revenue: await this.getRevenueTrends(dateRange)
        },
        recentActivities,
        topClients,
        systemHealth: await this.getSystemHealth()
      };
    }, adminId);
  }

  /**
   * Get client dashboard analytics
   */
  async getClientDashboard(clientId, timeframe = '30d') {
    return this.getCachedData('client_dashboard', async () => {
      const dateRange = this.getDateRange(timeframe);
      
      const [
        myOrders,
        myServiceRequests,
        myTransactions,
        myActivities,
        orderHistory,
        spendingTrends
      ] = await Promise.all([
        this.getClientOrders(clientId, dateRange),
        this.getClientServiceRequests(clientId, dateRange),
        this.getClientTransactions(clientId, dateRange),
        this.getClientActivities(clientId, dateRange),
        this.getClientOrderHistory(clientId),
        this.getClientSpendingTrends(clientId, dateRange)
      ]);

      // Calculate client-specific metrics
      const averageOrderValue = myOrders.total > 0 ? myOrders.totalValue / myOrders.total : 0;
      const completionRate = myOrders.total > 0 ? (myOrders.completed / myOrders.total) * 100 : 0;

      return {
        overview: {
          totalOrders: myOrders.total,
          pendingOrders: myOrders.pending,
          completedOrders: myOrders.completed,
          totalServiceRequests: myServiceRequests.total,
          activeServiceRequests: myServiceRequests.active,
          totalSpent: myTransactions.totalSpent,
          averageOrderValue,
          completionRate: Math.round(completionRate)
        },
        trends: {
          orders: orderHistory,
          spending: spendingTrends,
          activities: myActivities.dailyBreakdown
        },
        recentOrders: myOrders.recent,
        recentServiceRequests: myServiceRequests.recent,
        recentActivities: myActivities.recent
      };
    }, clientId);
  }

  /**
   * Get staff dashboard analytics
   */
  async getStaffDashboard(staffId, timeframe = '30d') {
    return this.getCachedData('staff_dashboard', async () => {
      const dateRange = this.getDateRange(timeframe);
      
      const [
        assignedTasks,
        completedTasks,
        myActivities,
        teamPerformance
      ] = await Promise.all([
        this.getStaffAssignedTasks(staffId, dateRange),
        this.getStaffCompletedTasks(staffId, dateRange),
        this.getStaffActivities(staffId, dateRange),
        this.getTeamPerformance(dateRange)
      ]);

      return {
        overview: {
          assignedTasks: assignedTasks.count,
          completedTasks: completedTasks.count,
          pendingTasks: assignedTasks.count - completedTasks.count,
          completionRate: assignedTasks.count > 0 ? 
            Math.round((completedTasks.count / assignedTasks.count) * 100) : 0
        },
        tasks: {
          assigned: assignedTasks.tasks,
          completed: completedTasks.tasks,
          recent: assignedTasks.recent
        },
        activities: myActivities,
        teamPerformance
      };
    }, staffId);
  }

  // Helper methods for data fetching
  async getTotalUsers(dateRange = null) {
    const query = {};
    if (dateRange) {
      query.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }
    
    const [total, clients, admins] = await Promise.all([
      User.countDocuments(query),
      User.countDocuments({ ...query, role: 'client' }),
      User.countDocuments({ ...query, role: { $in: ['admin', 'super_admin'] } })
    ]);
    
    return { count: total, clients, admins };
  }

  async getTotalOrders(dateRange) {
    const query = {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    };
    
    const [total, pending, completed, approved] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: { $in: ['Draft', 'Submitted', 'Under_Review'] } }),
      Order.countDocuments({ ...query, status: 'Completed' }),
      Order.countDocuments({ ...query, status: 'Approved' })
    ]);
    
    return { count: total, pending, completed, approved };
  }

  async getTotalServiceRequests(dateRange) {
    const query = {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    };
    
    const [total, active, completed] = await Promise.all([
      ServiceRequest.countDocuments(query),
      ServiceRequest.countDocuments({ ...query, status: { $in: ['submitted', 'under_review', 'in_progress'] } }),
      ServiceRequest.countDocuments({ ...query, status: 'completed' })
    ]);
    
    return { count: total, active, completed };
  }

  async getTotalRevenue(dateRange) {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: { $in: ['Approved', 'Completed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    return result[0] || { total: 0, count: 0 };
  }

  async getRecentActivities(limit = 10) {
    return UserActivity.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email role')
      .lean();
  }

  async getOrderTrends(dateRange) {
    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  async getUserGrowthTrends(dateRange) {
    return User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          roles: {
            $push: {
              role: '$_id.role',
              count: '$count'
            }
          },
          totalUsers: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  async getTopClients(dateRange) {
    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$total' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          businessName: '$user.businessName',
          totalOrders: 1,
          totalValue: 1,
          lastOrder: 1
        }
      },
      {
        $sort: { totalValue: -1 }
      },
      {
        $limit: 10
      }
    ]);
  }

  // Client-specific methods
  async getClientOrders(clientId, dateRange) {
    const query = {
      userId: clientId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    };

    const [orders, totalValue] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const statusCounts = await Order.aggregate([
      { $match: { userId: clientId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: orders.length,
      pending: statusMap['Submitted'] || 0,
      completed: statusMap['Completed'] || 0,
      totalValue: totalValue[0]?.total || 0,
      recent: orders
    };
  }

  async getClientServiceRequests(clientId, dateRange) {
    const query = {
      userId: clientId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    };

    const [requests, statusCounts] = await Promise.all([
      ServiceRequest.find(query).sort({ createdAt: -1 }).limit(5).lean(),
      ServiceRequest.aggregate([
        { $match: { userId: clientId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: requests.length,
      active: (statusMap['submitted'] || 0) + (statusMap['under_review'] || 0) + (statusMap['in_progress'] || 0),
      completed: statusMap['completed'] || 0,
      recent: requests
    };
  }

  async getClientTransactions(clientId, dateRange) {
    const query = {
      userId: clientId,
      date: { $gte: dateRange.start, $lte: dateRange.end }
    };

    const result = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totals = result.reduce((acc, item) => {
      acc[item._id] = { total: item.total, count: item.count };
      return acc;
    }, {});

    return {
      totalSpent: totals.expense?.total || 0,
      totalReceived: totals.income?.total || 0,
      transactionCount: (totals.expense?.count || 0) + (totals.income?.count || 0)
    };
  }

  async getClientActivities(clientId, dateRange) {
    const activities = await UserActivity.find({
      userId: clientId,
      timestamp: { $gte: dateRange.start, $lte: dateRange.end }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

    const dailyBreakdown = await UserActivity.aggregate([
      {
        $match: {
          userId: clientId,
          timestamp: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return {
      recent: activities,
      dailyBreakdown
    };
  }

  async getClientOrderHistory(clientId) {
    return Order.aggregate([
      {
        $match: { userId: clientId }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 12 // Last 12 months
      }
    ]);
  }

  async getClientSpendingTrends(clientId, dateRange) {
    return Order.aggregate([
      {
        $match: {
          userId: clientId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          spending: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  async getRevenueTrends(dateRange) {
    return Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: { $in: ['Approved', 'Completed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  }

  // Utility methods
  getDateRange(timeframe) {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    return { start, end };
  }

  getPreviousDateRange(timeframe) {
    const current = this.getDateRange(timeframe);
    const duration = current.end.getTime() - current.start.getTime();
    
    return {
      start: new Date(current.start.getTime() - duration),
      end: current.start
    };
  }

  calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getSystemHealth() {
    const [
      totalUsers,
      activeUsers,
      errorActivities,
      systemLoad
    ] = await Promise.all([
      User.countDocuments(),
      UserActivity.distinct('userId', {
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      UserActivity.countDocuments({
        'metadata.success': false,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      this.getSystemLoadMetrics()
    ]);
    
    return {
      totalUsers,
      activeUsers: activeUsers.length,
      errorRate: errorActivities,
      systemLoad,
      status: errorActivities < 10 ? 'healthy' : 'warning'
    };
  }

  async getSystemLoadMetrics() {
    // This would typically integrate with system monitoring tools
    // For now, return mock data
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };
  }
}

module.exports = new DashboardAnalytics();
