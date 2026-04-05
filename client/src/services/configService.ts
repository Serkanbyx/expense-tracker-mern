import type { AppConfig } from '@/types';
import api from './api';

export const getAppConfig = async (): Promise<AppConfig> => {
  const { data } = await api.get<AppConfig>('/config');
  return data;
};
