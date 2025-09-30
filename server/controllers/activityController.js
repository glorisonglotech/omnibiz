const UserActivity = require('../models/userActivity');
const { activityLogger } = require('../services/activityLogger');

// @desc    Get user's activity history
// @route   GET /api/activities/history
// @access  Private
const getUserActivityHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      category,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      entityType
    } = req.query;

    const options = {
      category,
      action,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    // Add entity type filter if provided
    const query = { userId };
    if (category) query.category = category;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [activities, totalCount] = await Promise.all([
      UserActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(options.limit)
        .skip(options.skip)
        .populate('entityId')
        .lean(),
      UserActivity.countDocuments(query)
    ]);

    // Log this activity view
    activityLogger.logActivity({
      userId,
      action: 'dashboard_viewed',
      category: 'system',
      description: 'Viewed activity history',
      metadata: {
        filters: { category, action, entityType },
        resultCount: activities.length
      }
    }, req);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / options.limit),
        totalCount,
        hasNext: parseInt(page) * options.limit < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({ message: 'Failed to fetch activity history' });
  }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
const getActivityStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30d' } = req.query;

    const stats = await UserActivity.getActivityStats(userId, timeframe);
    
    // Calculate additional metrics
    const totalActivities = stats.reduce((sum, stat) => sum + stat.totalActivities, 0);
    const successRate = totalActivities > 0 
      ? (stats.reduce((sum, stat) => sum + stat.successfulActivities, 0) / totalActivities * 100).toFixed(2)
      : 100;

    // Get recent high-risk activities
    const highRiskActivities = await UserActivity.find({
      userId,
      riskLevel: { $in: ['high', 'critical'] },
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .lean();

    // Get activity trends (daily counts for the timeframe)
    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const dailyTrends = await UserActivity.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: startDate }
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
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      summary: {
        totalActivities,
        successRate: parseFloat(successRate),
        timeframe,
        categoriesBreakdown: stats
      },
      trends: dailyTrends,
      highRiskActivities,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Failed to fetch activity statistics' });
  }
};

// @desc    Get activity details by ID
// @route   GET /api/activities/:id
// @access  Private
const getActivityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const activity = await UserActivity.findOne({ _id: id, userId })
      .populate('userId', 'name email role')
      .populate('entityId')
      .lean();

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Get related activities
    const relatedActivities = await UserActivity.find({
      userId,
      timestamp: {
        $gte: new Date(activity.timestamp.getTime() - 60 * 60 * 1000), // 1 hour before
        $lte: new Date(activity.timestamp.getTime() + 60 * 60 * 1000)  // 1 hour after
      },
      _id: { $ne: activity._id }
    })
    .sort({ timestamp: 1 })
    .limit(10)
    .lean();

    res.json({
      activity,
      relatedActivities
    });
  } catch (error) {
    console.error('Error fetching activity details:', error);
    res.status(500).json({ message: 'Failed to fetch activity details' });
  }
};

// @desc    Get system-wide activity overview (Admin only)
// @route   GET /api/activities/system-overview
// @access  Private (Admin)
const getSystemActivityOverview = async (req, res) => {
  try {
    const { timeframe = '24h', limit = 100 } = req.query;

    const startDate = new Date();
    switch (timeframe) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Get recent activities across all users
    const recentActivities = await UserActivity.find({
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('userId', 'name email role')
    .lean();

    // Get activity statistics by category
    const categoryStats = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$metadata.success', true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          successRate: {
            $multiply: [
              { $divide: ['$successCount', '$count'] },
              100
            ]
          }
        }
      }
    ]);

    // Get high-risk activities
    const highRiskActivities = await UserActivity.find({
      timestamp: { $gte: startDate },
      riskLevel: { $in: ['high', 'critical'] }
    })
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('userId', 'name email role')
    .lean();

    // Get user activity ranking
    const userActivityRanking = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          categories: { $addToSet: '$category' }
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
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          activityCount: 1,
          lastActivity: 1,
          categoriesCount: { $size: '$categories' }
        }
      },
      {
        $sort: { activityCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      overview: {
        timeframe,
        totalActivities: recentActivities.length,
        categoryBreakdown: categoryStats,
        highRiskCount: highRiskActivities.length
      },
      recentActivities,
      highRiskActivities,
      userActivityRanking,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching system activity overview:', error);
    res.status(500).json({ message: 'Failed to fetch system activity overview' });
  }
};

// @desc    Export activity data
// @route   POST /api/activities/export
// @access  Private
const exportActivityData = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      format = 'json',
      startDate,
      endDate,
      categories,
      includeMetadata = false
    } = req.body;

    const query = { userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .populate('userId', 'name email')
      .lean();

    // Remove sensitive metadata if not requested
    if (!includeMetadata) {
      activities.forEach(activity => {
        if (activity.metadata) {
          delete activity.metadata.ipAddress;
          delete activity.metadata.userAgent;
          delete activity.metadata.location;
          delete activity.metadata.device;
        }
      });
    }

    // Log the export activity
    activityLogger.logActivity({
      userId,
      action: 'data_exported',
      category: 'system',
      description: `Exported ${activities.length} activity records`,
      metadata: {
        format,
        recordCount: activities.length,
        dateRange: { startDate, endDate },
        categories
      }
    }, req);

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(activities);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="activity-export-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // Return JSON format
      res.json({
        exportInfo: {
          recordCount: activities.length,
          exportedAt: new Date(),
          format,
          filters: { startDate, endDate, categories }
        },
        data: activities
      });
    }
  } catch (error) {
    console.error('Error exporting activity data:', error);
    res.status(500).json({ message: 'Failed to export activity data' });
  }
};

// Helper function to convert activities to CSV
const convertToCSV = (activities) => {
  if (activities.length === 0) return '';

  const headers = ['Timestamp', 'Action', 'Category', 'Description', 'Success', 'IP Address'];
  const rows = activities.map(activity => [
    activity.timestamp.toISOString(),
    activity.action,
    activity.category,
    activity.description,
    activity.metadata?.success ? 'Yes' : 'No',
    activity.metadata?.ipAddress || 'N/A'
  ]);

  return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
};

module.exports = {
  getUserActivityHistory,
  getActivityStats,
  getActivityDetails,
  getSystemActivityOverview,
  exportActivityData
};
