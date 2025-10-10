import { useState } from 'react';
import { sendBulkNotification } from '@/utils/notifications';
import { Send, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  
  const handleSend = async () => {
    if (!title || !message) {
      toast({
        title: "Hata",
        description: "Başlık ve mesaj gerekli!",
        variant: "destructive"
      });
      return;
    }
    
    if (targetType === 'specific' && selectedUsers.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir kullanıcı seçmelisiniz!",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const userIds = targetType === 'all' ? undefined : selectedUsers;
      const sentCount = sendBulkNotification(title, message, userIds);
      
      toast({
        title: "Başarılı! 🎉",
        description: `${sentCount} kullanıcıya bildirim gönderildi!`,
      });
      
      // Reset form
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim gönderilemedi!",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send size={28} />
            Bildirim Gönder
          </h1>
          <p className="text-gray-600 mt-1">Kullanıcılara bildirim gönderin</p>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Target selection */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Hedef Kullanıcılar
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTargetType('all')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  targetType === 'all'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users size={20} />
                <span className="font-medium text-sm">Tüm Kullanıcılar ({users.length})</span>
              </button>
              
              <button
                onClick={() => setTargetType('specific')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  targetType === 'specific'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User size={20} />
                <span className="font-medium text-sm">Seçili Kullanıcılar</span>
              </button>
            </div>
          </div>
          
          {/* User selection */}
          {targetType === 'specific' && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcıları Seç ({selectedUsers.length} seçili)
              </Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto p-2">
                {users.map((user: any) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Title */}
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Başlığı
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Yeni Özellik Duyurusu 🎉"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/50 karakter</p>
          </div>
          
          {/* Message */}
          <div>
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Bildirim Mesajı
            </Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bildirim mesajınızı buraya yazın..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={4}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/200 karakter</p>
          </div>
          
          {/* Preview */}
          {(title || message) && (
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-xs font-medium text-gray-500 mb-2">ÖNİZLEME:</p>
              <div className="bg-white rounded-lg shadow-md p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📢</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {title || 'Bildirim Başlığı'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {message || 'Bildirim mesajı buraya gelecek...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Şimdi</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={loading || !title || !message || (targetType === 'specific' && selectedUsers.length === 0)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gönderiliyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send size={20} />
                Bildirim Gönder
              </div>
            )}
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{users.length}</p>
            <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u: any) => u.notificationSettings?.adminMessages !== false).length}
            </p>
            <p className="text-sm text-gray-600">Bildirim Açık</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {targetType === 'specific' ? selectedUsers.length : users.length}
            </p>
            <p className="text-sm text-gray-600">Hedef Kullanıcı</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
