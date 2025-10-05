import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import aiInsightsService from '@/services/aiInsightsService';

export const useRealTimeAI = (options = {}) => {
  const {
    autoStart = true,
    updateInterval = 30000,
    showNotifications = true,
    categories = null // Filter by specific categories
  } = options;

  const [insights, setInsights] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // Filter insights by categories if specified
  const filteredInsights = categories && Array.isArray(categories)
    ? insights.filter(insight => categories.includes(insight.category))
    : insights;

  // Handle insights updates
  const handleInsightsUpdate = useCallback((newInsights) => {
    let processedInsights = newInsights;

    // Filter by categories if specified
    if (categories && Array.isArray(categories)) {
      processedInsights = newInsights.filter(insight =>
        categories.includes(insight.category)
      );
    }

    // Check for new high-priority insights to show notifications
    if (showNotifications) {
      const newHighPriorityInsights = processedInsights.filter(insight =>
        insight.isNew && (insight.priority === 'critical' || insight.priority === 'high')
      );

      newHighPriorityInsights.forEach(insight => {
        const toastOptions = {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              // Mark as read when viewed
              aiInsightsService.markAsRead(insight.id);
            }
          }
        };

        if (insight.priority === 'critical') {
          toast.error(`🚨 ${insight.title}`, toastOptions);
        } else {
          toast.warning(`⚠️ ${insight.title}`, toastOptions);
        }
      });
    }

    setInsights(processedInsights);
    setError(null);
  }, [categories, showNotifications]);

  // Start real-time AI insights
  const startAI = useCallback(async () => {
    if (isActive) return;

    setLoading(true);
    setError(null);

    try {
      // Subscribe to insights updates
      const unsubscribe = aiInsightsService.subscribe(handleInsightsUpdate);
      unsubscribeRef.current = unsubscribe;

      // Start the AI service
      aiInsightsService.startRealTimeInsights(updateInterval);

      setIsActive(true);

      if (showNotifications) {
        toast.success('🤖 AI Insights activated - Real-time analysis started');
      }

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to start AI insights');
    } finally {
      setLoading(false);
    }
  }, [isActive, updateInterval, handleInsightsUpdate, showNotifications]);

  // Stop real-time AI insights
  const stopAI = useCallback(() => {
    if (!isActive) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    aiInsightsService.stopRealTimeInsights();
    setIsActive(false);

    if (showNotifications) {
      toast.info('🤖 AI Insights deactivated');
    }
  }, [isActive, showNotifications]);

  // Toggle AI insights
  const toggleAI = useCallback(() => {
    if (isActive) {
      stopAI();
    } else {
      startAI();
    }
  }, [isActive, startAI, stopAI]);

  // Generate new insights manually
  const generateInsights = useCallback(async () => {
    setLoading(true);
    try {
      await aiInsightsService.generateInsights();
      toast.success('🧠 New AI insights generated');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark insight as read
  const markAsRead = useCallback((insightId) => {
    aiInsightsService.markAsRead(insightId);
  }, []);

  // Clear all insights
  const clearInsights = useCallback(() => {
    aiInsightsService.clearInsights();
    toast.info('All insights cleared');
  }, []);

  // Get insights by priority
  const getInsightsByPriority = useCallback((priority) => {
    return filteredInsights.filter(insight => insight.priority === priority);
  }, [filteredInsights]);

  // Get actionable insights
  const getActionableInsights = useCallback(() => {
    return filteredInsights.filter(insight => insight.actionable || (insight.recommendations && insight.recommendations.length > 0));
  }, [filteredInsights]);

  // Get new insights count
  const getNewInsightsCount = useCallback(() => {
    return filteredInsights.filter(insight => insight.isNew).length;
  }, [filteredInsights]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startAI().then(unsub => {
        unsubscribeRef.current = unsub;
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (isActive) {
        aiInsightsService.stopRealTimeInsights();
      }
    };
  }, [autoStart, startAI]);

  // Get current insights on mount
  useEffect(() => {
    const currentInsights = aiInsightsService.getInsights();
    handleInsightsUpdate(currentInsights);
  }, [handleInsightsUpdate]);

  return {
    // State
    insights: filteredInsights,
    isActive,
    loading,
    error,

    // Actions
    startAI,
    stopAI,
    toggleAI,
    generateInsights,
    markAsRead,
    clearInsights,

    // Utilities
    getInsightsByPriority,
    getActionableInsights,
    getNewInsightsCount,

    // Stats
    totalInsights: filteredInsights.length,
    newInsights: getNewInsightsCount(),
    criticalInsights: getInsightsByPriority('critical').length,
    highPriorityInsights: getInsightsByPriority('high').length,
    actionableInsights: getActionableInsights().length
  };
};

// Hook for specific insight categories
export const useRealTimeAIByCategory = (category, options = {}) => {
  return useRealTimeAI({
    ...options,
    categories: [category]
  });
};

// Hook for high-priority insights only
export const useHighPriorityAI = (options = {}) => {
  const aiData = useRealTimeAI(options);

  const highPriorityInsights = aiData.insights.filter(insight =>
    insight.priority === 'critical' || insight.priority === 'high'
  );

  return {
    ...aiData,
    insights: highPriorityInsights
  };
};

// Hook for actionable insights only
export const useActionableAI = (options = {}) => {
  const aiData = useRealTimeAI(options);

  const actionableInsights = aiData.insights.filter(insight => insight.actionable);

  return {
    ...aiData,
    insights: actionableInsights
  };
};

export default useRealTimeAI;
