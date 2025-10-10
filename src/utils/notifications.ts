import type { Notification } from '@/types/notifications';

// Bildirim gönder
export const sendNotification = (
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
) => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex === -1) return;
  
  // Yeni bildirim oluştur
  const newNotification: Notification = {
    ...notification,
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Kullanıcının bildirim ayarlarını kontrol et
  const settings = users[userIndex].notificationSettings || {
    fortuneReady: true,
    dailyBonus: true,
    adminMessages: true
  };
  
  const shouldSend = 
    (notification.type === 'fortune_ready' && settings.fortuneReady !== false) ||
    (notification.type === 'daily_bonus' && settings.dailyBonus !== false) ||
    (notification.type === 'admin_message' && settings.adminMessages !== false) ||
    notification.type === 'system';
  
  if (shouldSend) {
    // Bildirimi ekle
    if (!users[userIndex].notifications) {
      users[userIndex].notifications = [];
    }
    
    users[userIndex].notifications.unshift(newNotification);
    
    // En fazla 50 bildirim tut
    if (users[userIndex].notifications.length > 50) {
      users[userIndex].notifications = users[userIndex].notifications.slice(0, 50);
    }
    
    localStorage.setItem('coffee_users', JSON.stringify(users));
    
    // Current user'ı güncelle
    const currentUser = JSON.parse(localStorage.getItem('coffee_current_user') || '{}');
    if (currentUser.id === userId) {
      localStorage.setItem('coffee_current_user', JSON.stringify(users[userIndex]));
    }
    
    // Browser notification (izin varsa)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
    
    // Event dispatch for real-time updates
    window.dispatchEvent(new Event('notificationsUpdated'));
  }
};

// Fal hazır bildirimi gönder
export const sendFortuneReadyNotification = (userId: string, fortuneId: string) => {
  sendNotification(userId, {
    type: 'fortune_ready',
    title: '✨ Falın Hazır!',
    message: 'Kahve falın yorumlandı. Hemen görmek ister misin?',
    fortuneId: fortuneId,
    actionUrl: '/fortune'
  });
};

// Günlük bonus hatırlatma
export const sendDailyBonusReminder = (userId: string) => {
  sendNotification(userId, {
    type: 'daily_bonus',
    title: '🎁 Günlük Bonus Zamanı!',
    message: '20 altın kazanmak için günlük bonusunu almayı unutma!',
    actionUrl: '/profile'
  });
};

// Admin mesajı gönder
export const sendAdminMessage = (userId: string, title: string, message: string) => {
  sendNotification(userId, {
    type: 'admin_message',
    title: title,
    message: message
  });
};

// Toplu bildirim gönder (tüm kullanıcılara)
export const sendBulkNotification = (title: string, message: string, userIds?: string[]) => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  
  const targetUsers = userIds 
    ? users.filter((u: any) => userIds.includes(u.id))
    : users;
  
  targetUsers.forEach((user: any) => {
    sendAdminMessage(user.id, title, message);
  });
  
  return targetUsers.length;
};

// Bildirimi okundu olarak işaretle
export const markAsRead = (userId: string, notificationId: string) => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex !== -1 && users[userIndex].notifications) {
    const notifIndex = users[userIndex].notifications.findIndex(
      (n: Notification) => n.id === notificationId
    );
    
    if (notifIndex !== -1) {
      users[userIndex].notifications[notifIndex].read = true;
      localStorage.setItem('coffee_users', JSON.stringify(users));
      
      // Current user'ı güncelle
      const currentUser = JSON.parse(localStorage.getItem('coffee_current_user') || '{}');
      if (currentUser.id === userId) {
        localStorage.setItem('coffee_current_user', JSON.stringify(users[userIndex]));
      }
      
      window.dispatchEvent(new Event('notificationsUpdated'));
    }
  }
};

// Tüm bildirimleri okundu işaretle
export const markAllAsRead = (userId: string) => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex !== -1 && users[userIndex].notifications) {
    users[userIndex].notifications = users[userIndex].notifications.map((n: Notification) => ({
      ...n,
      read: true
    }));
    
    localStorage.setItem('coffee_users', JSON.stringify(users));
    
    const currentUser = JSON.parse(localStorage.getItem('coffee_current_user') || '{}');
    if (currentUser.id === userId) {
      localStorage.setItem('coffee_current_user', JSON.stringify(users[userIndex]));
    }
    
    window.dispatchEvent(new Event('notificationsUpdated'));
  }
};

// Okunmamış bildirim sayısı
export const getUnreadCount = (userId: string): number => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const user = users.find((u: any) => u.id === userId);
  
  if (!user || !user.notifications) return 0;
  
  return user.notifications.filter((n: Notification) => !n.read).length;
};

// Bildirimleri getir
export const getNotifications = (userId: string): Notification[] => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const user = users.find((u: any) => u.id === userId);
  
  return user?.notifications || [];
};
