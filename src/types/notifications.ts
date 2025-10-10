export interface Notification {
  id: string;
  type: 'fortune_ready' | 'daily_bonus' | 'admin_message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  fortuneId?: string;
  actionUrl?: string;
}

export interface NotificationSettings {
  fortuneReady: boolean;
  dailyBonus: boolean;
  adminMessages: boolean;
}
