/**
 * Subscription Tier Access Control System
 * Defines feature access and limits for each subscription tier
 */

export const SUBSCRIPTION_TIERS = {
  CLIENT: 'client',
  STANDARD: 'standard',
  PROFESSIONAL: 'professional',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

export const SUBSCRIPTION_FEATURES = {
  // Core features
  DASHBOARD_ACCESS: 'dashboard_access',
  ANALYTICS: 'analytics',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  TEAM_MANAGEMENT: 'team_management',
  REPORTS: 'reports',
  CUSTOM_REPORTS: 'custom_reports',
  
  // Financial features
  WALLET: 'wallet',
  WALLET_PAYMENTS: 'wallet_payments',
  WALLET_INVESTMENTS: 'wallet_investments',
  PAYMENT_GATEWAY_INTEGRATION: 'payment_gateway_integration',
  
  // Advanced features
  AI_INSIGHTS: 'ai_insights',
  AI_CHAT: 'ai_chat',
  API_ACCESS: 'api_access',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  AUTOMATED_WORKFLOWS: 'automated_workflows',
  MAPS: 'maps',
  REAL_TIME_SYNC: 'real_time_sync',
  
  // Collaboration features
  MULTI_LOCATION: 'multi_location',
  BULK_OPERATIONS: 'bulk_operations',
  DATA_EXPORT: 'data_export',
  CUSTOM_BRANDING: 'custom_branding',
  
  // Support features
  EMAIL_SUPPORT: 'email_support',
  PRIORITY_SUPPORT: 'priority_support',
  PHONE_SUPPORT: 'phone_support',
  DEDICATED_ACCOUNT_MANAGER: 'dedicated_account_manager'
};

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.CLIENT]: {
    name: 'Client',
    description: 'Very limited access - Invited by subscription owners only',
    price: 0,
    features: [
      SUBSCRIPTION_FEATURES.DASHBOARD_ACCESS,
      SUBSCRIPTION_FEATURES.EMAIL_SUPPORT
    ],
    limits: {
      products: 10,
      orders: 50,
      teamMembers: 0, // Cannot invite
      storage: '500MB',
      apiCalls: 0,
      locations: 1,
      customers: 100,
      reports: 'basic',
      canInviteUsers: false,
      canCreateOrders: false,
      canViewReports: true,
      canEditProducts: false,
      accessLevel: 'read-only'
    },
    restrictions: [
      'Read-only access',
      'Cannot create or modify data',
      'Cannot invite team members',
      'Limited to viewing assigned data only',
      'No API access',
      'No export capabilities'
    ]
  },
  
  [SUBSCRIPTION_TIERS.STANDARD]: {
    name: 'Standard',
    description: 'Limited features for small businesses',
    price: 0,
    features: [
      SUBSCRIPTION_FEATURES.DASHBOARD_ACCESS,
      SUBSCRIPTION_FEATURES.ANALYTICS,
      SUBSCRIPTION_FEATURES.INVENTORY,
      SUBSCRIPTION_FEATURES.ORDERS,
      SUBSCRIPTION_FEATURES.CUSTOMERS,
      SUBSCRIPTION_FEATURES.WALLET,
      SUBSCRIPTION_FEATURES.REPORTS,
      SUBSCRIPTION_FEATURES.EMAIL_SUPPORT
    ],
    limits: {
      products: 100,
      orders: 500,
      teamMembers: 5,
      storage: '5GB',
      apiCalls: 1000,
      locations: 1,
      customers: 1000,
      reports: 'basic',
      canInviteUsers: true,
      canCreateOrders: true,
      canViewReports: true,
      canEditProducts: true,
      accessLevel: 'standard'
    },
    restrictions: [
      'Limited to 100 products',
      'Basic analytics only',
      'Single location only',
      'No AI features',
      'No custom integrations',
      'Limited API access'
    ]
  },
  
  [SUBSCRIPTION_TIERS.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 29,
    features: [
      SUBSCRIPTION_FEATURES.DASHBOARD_ACCESS,
      SUBSCRIPTION_FEATURES.ANALYTICS,
      SUBSCRIPTION_FEATURES.ADVANCED_ANALYTICS,
      SUBSCRIPTION_FEATURES.INVENTORY,
      SUBSCRIPTION_FEATURES.ORDERS,
      SUBSCRIPTION_FEATURES.CUSTOMERS,
      SUBSCRIPTION_FEATURES.TEAM_MANAGEMENT,
      SUBSCRIPTION_FEATURES.WALLET,
      SUBSCRIPTION_FEATURES.WALLET_PAYMENTS,
      SUBSCRIPTION_FEATURES.PAYMENT_GATEWAY_INTEGRATION,
      SUBSCRIPTION_FEATURES.REPORTS,
      SUBSCRIPTION_FEATURES.CUSTOM_REPORTS,
      SUBSCRIPTION_FEATURES.AI_INSIGHTS,
      SUBSCRIPTION_FEATURES.AI_CHAT,
      SUBSCRIPTION_FEATURES.MAPS,
      SUBSCRIPTION_FEATURES.MULTI_LOCATION,
      SUBSCRIPTION_FEATURES.AUTOMATED_WORKFLOWS,
      SUBSCRIPTION_FEATURES.DATA_EXPORT,
      SUBSCRIPTION_FEATURES.API_ACCESS,
      SUBSCRIPTION_FEATURES.PRIORITY_SUPPORT
    ],
    limits: {
      products: 'unlimited',
      orders: 'unlimited',
      teamMembers: 'unlimited',
      storage: '100GB',
      apiCalls: 10000,
      locations: 5,
      customers: 'unlimited',
      reports: 'advanced',
      canInviteUsers: true,
      canCreateOrders: true,
      canViewReports: true,
      canEditProducts: true,
      accessLevel: 'full'
    },
    restrictions: []
  },
  
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    name: 'Premium',
    description: 'Full access - For developers and power users',
    price: 49,
    features: [
      ...Object.values(SUBSCRIPTION_FEATURES)
    ],
    limits: {
      products: 'unlimited',
      orders: 'unlimited',
      teamMembers: 'unlimited',
      storage: 'unlimited',
      apiCalls: 'unlimited',
      locations: 'unlimited',
      customers: 'unlimited',
      reports: 'custom',
      canInviteUsers: true,
      canCreateOrders: true,
      canViewReports: true,
      canEditProducts: true,
      canCustomize: true,
      accessLevel: 'full-premium',
      developerTools: true,
      whiteLabel: true
    },
    restrictions: []
  },
  
  [SUBSCRIPTION_TIERS.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 'custom',
    features: [
      ...Object.values(SUBSCRIPTION_FEATURES)
    ],
    limits: {
      products: 'unlimited',
      orders: 'unlimited',
      teamMembers: 'unlimited',
      storage: 'unlimited',
      apiCalls: 'unlimited',
      locations: 'unlimited',
      customers: 'unlimited',
      reports: 'custom',
      canInviteUsers: true,
      canCreateOrders: true,
      canViewReports: true,
      canEditProducts: true,
      canCustomize: true,
      accessLevel: 'enterprise',
      developerTools: true,
      whiteLabel: true,
      onPremise: true,
      sla: true
    },
    restrictions: []
  }
};

/**
 * Check if user has access to a specific feature
 * @param {string} userTier - Current user subscription tier
 * @param {string} feature - Feature to check access for
 * @returns {boolean}
 */
export const hasFeatureAccess = (userTier, feature) => {
  if (!userTier || !feature) return false;
  
  const tierConfig = TIER_LIMITS[userTier];
  if (!tierConfig) return false;
  
  return tierConfig.features.includes(feature);
};

/**
 * Check if user can perform an action based on limits
 * @param {string} userTier - Current user subscription tier
 * @param {string} limitType - Type of limit to check
 * @param {number} currentCount - Current count of items
 * @returns {boolean}
 */
export const canPerformAction = (userTier, limitType, currentCount = 0) => {
  const tierConfig = TIER_LIMITS[userTier];
  if (!tierConfig) return false;
  
  const limit = tierConfig.limits[limitType];
  
  if (limit === 'unlimited') return true;
  if (typeof limit === 'number') return currentCount < limit;
  
  return false;
};

/**
 * Get upgrade message for blocked feature
 * @param {string} userTier - Current user subscription tier
 * @param {string} feature - Blocked feature
 * @returns {string}
 */
export const getUpgradeMessage = (userTier, feature) => {
  const featureName = feature.replace(/_/g, ' ').toLowerCase();
  
  switch (userTier) {
    case SUBSCRIPTION_TIERS.CLIENT:
      return `${featureName} requires a paid subscription. Please contact your organization owner for access.`;
    case SUBSCRIPTION_TIERS.STANDARD:
      return `Upgrade to Professional to unlock ${featureName} and more advanced features.`;
    case SUBSCRIPTION_TIERS.PROFESSIONAL:
      return `Upgrade to Premium for ${featureName} and unlimited access.`;
    default:
      return `Upgrade your plan to access ${featureName}.`;
  }
};

/**
 * Get minimum tier required for a feature
 * @param {string} feature - Feature to check
 * @returns {string}
 */
export const getMinimumTierForFeature = (feature) => {
  for (const [tier, config] of Object.entries(TIER_LIMITS)) {
    if (config.features.includes(feature)) {
      return tier;
    }
  }
  return SUBSCRIPTION_TIERS.PREMIUM;
};

/**
 * Check if user tier is at least the required tier
 * @param {string} userTier - Current user tier
 * @param {string} requiredTier - Required tier
 * @returns {boolean}
 */
export const hasMinimumTier = (userTier, requiredTier) => {
  const tierHierarchy = [
    SUBSCRIPTION_TIERS.CLIENT,
    SUBSCRIPTION_TIERS.STANDARD,
    SUBSCRIPTION_TIERS.PROFESSIONAL,
    SUBSCRIPTION_TIERS.PREMIUM,
    SUBSCRIPTION_TIERS.ENTERPRISE
  ];
  
  const userIndex = tierHierarchy.indexOf(userTier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
};

/**
 * Get feature comparison between tiers
 * @param {string} currentTier - Current tier
 * @param {string} targetTier - Target tier to compare
 * @returns {object}
 */
export const getFeatureComparison = (currentTier, targetTier) => {
  const currentFeatures = TIER_LIMITS[currentTier]?.features || [];
  const targetFeatures = TIER_LIMITS[targetTier]?.features || [];
  
  return {
    current: currentFeatures,
    target: targetFeatures,
    new: targetFeatures.filter(f => !currentFeatures.includes(f)),
    common: targetFeatures.filter(f => currentFeatures.includes(f))
  };
};

export default {
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_FEATURES,
  TIER_LIMITS,
  hasFeatureAccess,
  canPerformAction,
  getUpgradeMessage,
  getMinimumTierForFeature,
  hasMinimumTier,
  getFeatureComparison
};
