export interface Zone {
  id: string;
  name: string;
  active: boolean;
  schedule: Schedule[];
}

export interface Schedule {
  id: string;
  zoneId: string;
  startTime: string;
  duration: number; // in minutes
  days: number[]; // 0-6 for Sunday-Saturday
  active: boolean;
}

export interface WateringSession {
  id: string;
  zoneId: string;
  startTime: Date;
  endTime: Date;
  waterUsage: number; // in liters
  automatic: boolean;
}

export interface SystemStatus {
  waterPressure: number; // in bars (0-5)
  timestamp: string; // ISO string format
  operationMode: 'automatic' | 'online';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

export interface NotificationSettings {
  systemAlerts: boolean;
  wateringEvents: boolean;
  pressureWarnings: boolean;
  dailyReport: boolean;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    zones: Zone[];
    sessions: WateringSession[];
    settings: {
      notifications: NotificationSettings;
      backupInterval: string;
    };
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SiteSettings {
  ogImage: string;
}