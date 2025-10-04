import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import aiInsightsService from '@/services/aiInsightsService';

export const useRealTimeAI = (options = {}) => {
  const {
    autoStart = true,
    updateInterval = 30000,
    showNotifications = true,
    categories = null
  } = options;

  const [insights, setInsights] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // Filter insights by categories if specified
  const filteredInsights = categories 
    ? insights.filter(insight => categories.includes(insight.category))
    : insights;

  // Statistics
  const totalInsights = filteredInsights.length;
  const newInsights = filteredInsights.filter(insight => 
    new Date() - new Date(insight.timestamp) < 300000 // 5 minutes
  ).length;
  const criticalInsights = filteredInsights.filter(insight => 
    insight.priority === 'critical'
  ).length;
  const highPriorityInsights = filteredInsights.filter(insight => 
    insight.priority === 'high'
  ).length;
  const actionableInsights = filteredInsights.filter(insight => 
    insight.recommendations && insight.recommendations.length > 0
  ).length;

  // Start AI insights
  const startAI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Subscribe to insights updates
      const unsubscribe = aiInsightsService.subscribe((newInsights) => {
        setInsights(newInsights);
        
        // Show notifications for high-priority insights
        if (showNotifications) {
          const recentHighPriority = newInsights.filter(insight => {
            const isRecent = new Date() - new Date(insight.timestamp) < 10000; // 10 seconds
            return isRecent && (insight.priority === 'critical' || insight.priority === 'high');
          });
          
          recentHighPriority.forEach(insight => {
            toast.info(`🤖 AI Insight: ${insight.title}`, {
              description: insight.description,
              duration: 5000
            });
          });
        }
      });
      
      unsubscribeRef.current = unsubscribe;
      
      // Start the service
      aiInsightsService.startRealTimeInsights(updateInterval);
      setIsActive(true);
      
      return unsubscribe;
    } catch (err) {
      setError(err.message);
      console.error('Error starting AI insights:', err);
    } finally {
      setLoading(false);
    }
  }, [updateInterval, showNotifications]);

  // Stop AI insights
  const stopAI = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    aiInsightsService.stopRealTimeInsights();
    setIsActive(false);
  }, []);

  // Toggle AI insights
  const toggleAI = useCallback(() => {
    if (isActive) {
      stopAI();
    } else {
      startAI();
    }
  }, [isActive, startAI, stopAI]);

  // Generate insights manually
  const generateInsights = useCallback(() => {
    if (isActive) {
      aiInsightsService.generateInsights();
      toast.success('Generating new AI insights...');
    }
  }, [isActive]);

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

  return {
    insights: filteredInsights,
    isActive,
    loading,
    error,
    startAI,
    stopAI,
    toggleAI,
    generateInsights,
    // Statistics
    totalInsights,
    newInsights,
    criticalInsights,
    highPriorityInsights,
    actionableInsights
  };
};

export default useRealTimeAI;
