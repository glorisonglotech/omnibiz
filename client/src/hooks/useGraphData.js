import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// Mock data generators for different chart types
export const generateMockGraphData = (type = 'trend', days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let value, value2, value3;
    
    switch (type) {
      case 'growth':
        value = Math.floor(Math.random() * 1000) + (days - i) * 50;
        value2 = Math.floor(Math.random() * 800) + (days - i) * 30;
        break;
      case 'trend':
        value = Math.floor(Math.random() * 500) + 200;
        value2 = Math.floor(Math.random() * 300) + 100;
        break;
      case 'volatile':
        value = Math.floor(Math.random() * 2000) + 100;
        value2 = Math.floor(Math.random() * 1500) + 50;
        break;
      default:
        value = Math.floor(Math.random() * 1000) + 100;
        value2 = Math.floor(Math.random() * 800) + 80;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
      value2,
      revenue: value,
      expenses: value2,
      profit: value - value2,
      orders: Math.floor(Math.random() * 50) + 10,
      customers: Math.floor(Math.random() * 30) + 5,
      products: Math.floor(Math.random() * 20) + 1
    });
  }
  
  return data;
};

// Custom hook for managing graph data
export const useGraphData = (config = {}) => {
  const {
    endpoint = null,
    type = 'trend',
    days = 30,
    autoRefresh = false,
    refreshInterval = 60000,
    transform = null
  } = config;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      // Use mock data if no endpoint provided
      const mockData = generateMockGraphData(type, days);
      setData(transform ? transform(mockData) : mockData);
      setLastUpdated(new Date());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(endpoint);
      let responseData = response.data?.data || response.data || [];
      
      if (transform) {
        responseData = transform(responseData);
      }
      
      setData(responseData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError(err.message || 'Failed to fetch data');
      // Fallback to mock data on error
      const mockData = generateMockGraphData(type, days);
      setData(transform ? transform(mockData) : mockData);
    } finally {
      setLoading(false);
    }
  }, [endpoint, type, days, transform]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    setData
  };
};

// Hook for managing multiple graph datasets
export const useMultipleGraphData = (configs = []) => {
  const [datasets, setDatasets] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const newDatasets = {};
    const newErrors = {};

    await Promise.all(
      configs.map(async (config, index) => {
        const key = config.key || `dataset_${index}`;
        
        try {
          if (config.endpoint) {
            const response = await api.get(config.endpoint);
            let data = response.data?.data || response.data || [];
            
            if (config.transform) {
              data = config.transform(data);
            }
            
            newDatasets[key] = data;
          } else {
            // Use mock data
            const mockData = generateMockGraphData(config.type || 'trend', config.days || 30);
            newDatasets[key] = config.transform ? config.transform(mockData) : mockData;
          }
        } catch (error) {
          console.error(`Error fetching data for ${key}:`, error);
          newErrors[key] = error.message;
          // Fallback to mock data
          const mockData = generateMockGraphData(config.type || 'trend', config.days || 30);
          newDatasets[key] = config.transform ? config.transform(mockData) : mockData;
        }
      })
    );

    setDatasets(newDatasets);
    setErrors(newErrors);
    setLoading(false);
  }, [configs]);

  useEffect(() => {
    if (configs.length > 0) {
      fetchAllData();
    }
  }, [fetchAllData]);

  return {
    datasets,
    loading,
    errors,
    refreshAll: fetchAllData
  };
};

// Data transformation utilities
export const dataTransformers = {
  // Transform for revenue/expense comparison
  financialComparison: (data) => {
    return data.map(item => ({
      ...item,
      profit: (item.revenue || item.value) - (item.expenses || item.value2 || 0),
      profitMargin: item.revenue ? ((item.revenue - (item.expenses || 0)) / item.revenue * 100).toFixed(1) : 0
    }));
  },

  // Transform for growth percentage
  growthPercentage: (data) => {
    return data.map((item, index) => {
      if (index === 0) return { ...item, growth: 0 };
      
      const prevValue = data[index - 1].value || 0;
      const currentValue = item.value || 0;
      const growth = prevValue ? ((currentValue - prevValue) / prevValue * 100).toFixed(1) : 0;
      
      return { ...item, growth: parseFloat(growth) };
    });
  },

  // Transform for cumulative values
  cumulative: (data) => {
    let cumulative = 0;
    return data.map(item => {
      cumulative += item.value || 0;
      return { ...item, cumulative };
    });
  },

  // Transform for moving average
  movingAverage: (data, window = 7) => {
    return data.map((item, index) => {
      const start = Math.max(0, index - window + 1);
      const slice = data.slice(start, index + 1);
      const average = slice.reduce((sum, d) => sum + (d.value || 0), 0) / slice.length;
      
      return { ...item, movingAverage: Math.round(average) };
    });
  }
};

export default useGraphData;
