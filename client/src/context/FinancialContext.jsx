import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

const FinancialContext = createContext();

export const useFinancial = () => {
  return useContext(FinancialContext);
};

export const FinancialProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [financialData, setFinancialData] = useState({
    summary: null,
    transactions: [],
    loading: true,
    error: null
  });

  // Fetch financial summary
  const fetchFinancialSummary = async () => {
    try {
      const response = await api.get('/financial-summary');
      setFinancialData(prev => ({
        ...prev,
        summary: response.data,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      setFinancialData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setFinancialData(prev => ({
        ...prev,
        transactions: response.data,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setFinancialData(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  // Refresh all financial data
  const refreshFinancialData = async () => {
    setFinancialData(prev => ({ ...prev, loading: true }));
    await Promise.all([
      fetchFinancialSummary(),
      fetchTransactions()
    ]);
  };

  // Add a new transaction (for real-time updates)
  const addTransaction = (transaction) => {
    setFinancialData(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
    // Refresh summary to reflect new transaction
    fetchFinancialSummary();
  };

  // Update transaction
  const updateTransaction = (updatedTransaction) => {
    setFinancialData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t._id === updatedTransaction._id ? updatedTransaction : t
      )
    }));
    // Refresh summary to reflect updated transaction
    fetchFinancialSummary();
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      refreshFinancialData();
    }
  }, [isAuthenticated]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchFinancialSummary();
      fetchTransactions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    ...financialData,
    refreshFinancialData,
    addTransaction,
    updateTransaction,
    fetchFinancialSummary,
    fetchTransactions
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};
