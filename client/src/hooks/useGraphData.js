import { useState, useEffect, useCallback } from 'react';

export const generateMockGraphData = (type = 'trend', days = 30) => {
  const data = [];
  const baseValue = 1000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    const trend = type === 'growth' ? i * 20 : type === 'decline' ? -i * 10 : Math.sin(i / 5) * 100;
    const randomVariation = (Math.random() - 0.5) * 200;
    
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString().split('T')[0],
      value: Math.max(0, baseValue + trend + randomVariation),
      revenue: Math.max(0, baseValue + trend + randomVariation),
      profit: Math.max(0, (baseValue + trend + randomVariation) * 0.3),
      loss: Math.max(0, (baseValue + trend + randomVariation) * 0.1),
      orders: Math.floor(20 + Math.random() * 50 + i * 2),
      customers: Math.floor(10 + Math.random() * 30 + i),
      products: Math.floor(5 + Math.random() * 15)
    });
  }
  
  return data;
};

export const useGraphData = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    data,
    loading,
    error,
    refresh: () => {}
  };
};
