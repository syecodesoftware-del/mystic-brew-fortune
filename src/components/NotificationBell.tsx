import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from '@/utils/notifications';
import { Notification } from '@/types/notifications';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('coffee_current_user') || '{}');
  
  const updateNotifications = () => {
    if (user.id) {
      setUnreadCount(getUnreadCount(user.id));
      setNotifications(getNotifications(user.id));
    }
  };
  
  useEffect(() => {
    updateNotifications();
    
    // Listen for notification updates
    const handleUpdate = () => updateNotifications();
    window.addEventListener('notificationsUpdated', handleUpdate);
    
    // Refresh every 30 seconds
    const interval = setInterval(updateNotifications, 30000);
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, [user.id]);
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(user.id, notification.id);
    updateNotifications();
    
    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };
  
  const handleMarkAllRead = () => {
    markAllAsRead(user.id);
    updateNotifications();
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'fortune_ready': return '✨';
      case 'daily_bonus': return '🎁';
      case 'admin_message': return '📢';
      case 'system': return '🔔';
      default: return '📬';
    }
  };
  
  return (
    <div className="relative">
      {/* Notification bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={20} />
        
        {/* Badge (unread count) */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      
      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification list */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between">
                <h3 className="font-bold">Bildirimler</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs underline hover:no-underline"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
              
              {/* Notification list */}
              <div className="overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz bildiriminiz yok</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full p-4 border-b hover:bg-gray-50 text-left transition-colors ${
                        !notif.read ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {notif.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.timestamp).toLocaleString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        {/* Unread indicator */}
                        {!notif.read && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
