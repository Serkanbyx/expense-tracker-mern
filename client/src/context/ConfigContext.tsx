import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAppConfig } from '../services/configService';
import type { AppConfig, ChildrenProps } from '@/types';

const FALLBACK_CONFIG: AppConfig = {
  transactionTypes: ['income', 'expense'],
  categories: ['food', 'salary', 'transport', 'entertainment', 'health', 'education', 'shopping', 'bills', 'other'],
  incomeCategories: ['salary', 'other'],
  expenseCategories: ['food', 'transport', 'entertainment', 'health', 'education', 'shopping', 'bills', 'other'],
};

interface ConfigContextValue {
  config: AppConfig;
  isLoaded: boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider = ({ children }: ChildrenProps) => {
  const [config, setConfig] = useState<AppConfig>(FALLBACK_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const data = await getAppConfig();
      setConfig(data);
    } catch {
      console.warn('Failed to load config from server, using fallback values');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <ConfigContext.Provider value={{ config, isLoaded }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
};
