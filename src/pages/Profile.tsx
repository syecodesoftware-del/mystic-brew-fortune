import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit, Save, X, Download, Trash2, 
  Calendar, Clock, Eye, EyeOff, Sparkles, ArrowLeft, MapPin, Coins, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile, getUserFortunes, deleteFortune, downloadFortune, checkAndGiveDailyBonus, type Fortune } from '@/lib/auth';
import logo from '@/assets/logo.png';

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState<Fortune | null>(null);
  const [fortuneToDelete, setFortuneToDelete] = useState<number | null>(null);
  const [canClaimBonus, setCanClaimBonus] = useState(false);
  const [timeUntilNextBonus, setTimeUntilNextBonus] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    birthDate: user?.birthDate || '',
    birthTime: user?.birthTime || '',
    city: user?.city || '',
    gender: user?.gender || '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  const fortunes = getUserFortunes().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Check bonus availability
  const checkBonusAvailability = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastBonus = user.lastDailyBonus;
    
    const canClaim = lastBonus !== today;
    setCanClaimBonus(canClaim);
    
    if (!canClaim) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - new Date().getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNextBonus(`${hours}s ${minutes}d`);
    }
  };
  
  // Check on mount and every minute
  useState(() => {
    checkBonusAvailability();
    const interval = setInterval(checkBonusAvailability, 60000);
    return () => clearInterval(interval);
  });
  
  const handleClaimBonus = () => {
    const bonus = checkAndGiveDailyBonus();
    if (bonus) {
      setCanClaimBonus(false);
      toast({
        title: bonus.message,
        description: `Yeni bakiyen: ${bonus.newBalance} 💰`,
      });
      
      // Reload user data
      const updatedUsers = JSON.parse(localStorage.getItem('coffee_users') || '[]');
      const updatedUser = updatedUsers.find((u: any) => u.id === user?.id);
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      window.dispatchEvent(new Event('coinsUpdated'));
      checkBonusAvailability();
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (userId?: string) => {
    if (!userId) return 'from-purple-500 to-pink-500';
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      birthDate: user?.birthDate || '',
      birthTime: user?.birthTime || '',
      city: user?.city || '',
      gender: user?.gender || '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      birthDate: user?.birthDate || '',
      birthTime: user?.birthTime || '',
      city: user?.city || '',
      gender: user?.gender || '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    });
  };

  const handleSave = () => {
    try {
      if (formData.firstName.length < 2 || formData.lastName.length < 2) {
        throw new Error('Ad ve soyad en az 2 karakter olmalı');
      }

      const updatedUser = updateUserProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      
      toast({
        title: "Başarılı! ✨",
        description: "Profiliniz güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: "destructive"
      });
    }
  };

  const handleDeleteFortune = (fortuneId: number) => {
    deleteFortune(fortuneId);
    setFortuneToDelete(null);
    updateUser({ ...user!, fortunes: getUserFortunes() });
    
    toast({
      title: "Silindi",
      description: "Fal geçmişinizden kaldırıldı",
      variant: "destructive"
    });
  };

  const handleDownloadFortune = (fortune: Fortune) => {
    downloadFortune(fortune);
    toast({
      title: "İndirildi 📥",
      description: "Falınız başarıyla indirildi",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-mystic">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-accent/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/fortune')}
            variant="outline"
            className="border-accent/50 text-foreground hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Falcan Logo" className="w-8 h-8" />
            <span className="text-foreground font-semibold">Dijital Kahve Falın</span>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* User Summary */}
          <div className="bg-gradient-card rounded-3xl p-8 shadow-mystic text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className={`bg-gradient-to-br ${getAvatarColor(user.id)} text-white text-3xl font-bold`}>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {user.firstName} {user.lastName}
            </h1>
            
            <p className="text-muted-foreground mb-4">
              Üye olma: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </p>
            
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-foreground font-semibold">
                {fortunes.length} fal baktırıldı 🔮
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50">
              <TabsTrigger value="info">📝 Bilgilerim</TabsTrigger>
              <TabsTrigger value="history">📜 Fal Geçmişim</TabsTrigger>
            </TabsList>

            {/* Tab 1: Bilgilerim */}
            <TabsContent value="info">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Coin Stats */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-400">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-600" />
                    💰 Altın Durumu
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Mevcut Bakiye</p>
                      <p className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                        <Coins className="w-5 h-5" />
                        {user.coins || 0}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Toplam Kazanılan</p>
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <Coins className="w-5 h-5" />
                        {user.totalCoinsEarned || 0}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Toplam Harcanan</p>
                      <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
                        <Coins className="w-5 h-5" />
                        {user.totalCoinsSpent || 0}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Son Günlük Bonus</p>
                      <p className="text-sm font-medium text-gray-800">
                        {user.lastDailyBonus ? new Date(user.lastDailyBonus).toLocaleDateString('tr-TR') : 'Henüz alınmadı'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Daily Bonus Button */}
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      🎁 Günlük Bonus
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Her gün 20 altın kazan!</p>
                    
                    {canClaimBonus ? (
                      <Button
                        onClick={handleClaimBonus}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-lg"
                      >
                        <Coins className="w-5 h-5 mr-2" />
                        💰 20 Altın Al
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed"
                      >
                        ✅ Bugünkü bonus alındı
                        {timeUntilNextBonus && <span className="block text-xs mt-1">Sonraki: {timeUntilNextBonus}</span>}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-gradient-card rounded-2xl p-6 shadow-mystic">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <User className="w-6 h-6" />
                      Kişisel Bilgiler
                    </h2>
                    {!isEditing && (
                      <Button onClick={handleEdit} variant="outline" className="border-accent/50">
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Ad</Label>
                      {isEditing ? (
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Adınız"
                        />
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground">{user.firstName}</div>
                      )}
                    </div>

                    <div>
                      <Label>Soyad</Label>
                      {isEditing ? (
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Soyadınız"
                        />
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground">{user.lastName}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>E-posta</Label>
                    <div className="bg-card/50 p-3 rounded-lg text-muted-foreground">
                      {user.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Doğum Tarihi</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.birthDate).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Doğum Saati</Label>
                      {isEditing ? (
                        <Input
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                        />
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {user.birthTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Şehir</Label>
                      {isEditing ? (
                        <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                          <SelectTrigger className="bg-card/50">
                            <SelectValue placeholder="Şehir seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50 max-h-[300px]">
                            {TURKISH_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {user.city || 'Belirtilmemiş'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Cinsiyet</Label>
                      {isEditing ? (
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                          <SelectTrigger className="bg-card/50">
                            <SelectValue placeholder="Cinsiyet seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50">
                            <SelectItem value="Kadın">Kadın</SelectItem>
                            <SelectItem value="Erkek">Erkek</SelectItem>
                            <SelectItem value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="bg-card/50 p-3 rounded-lg text-foreground">
                          {user.gender || 'Belirtilmemiş'}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-accent/20">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Şifre Değiştir (Opsiyonel)</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>Mevcut Şifre</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                              placeholder="Mevcut şifreniz"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label>Yeni Şifre</Label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                              placeholder="Yeni şifre (min 6 karakter)"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label>Yeni Şifre Tekrar</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.newPasswordConfirm}
                              onChange={(e) => setFormData({ ...formData, newPasswordConfirm: e.target.value })}
                              placeholder="Yeni şifrenizi tekrar girin"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleSave} className="flex-1 bg-accent hover:bg-accent/90">
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        <X className="w-4 h-4 mr-2" />
                        İptal
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Tab 2: Fal Geçmişim */}
            <TabsContent value="history">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {fortunes.length === 0 ? (
                  <div className="bg-gradient-card rounded-2xl p-12 shadow-mystic text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Henüz fala baktırmadınız
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      İlk falınızı baktırın ve enerjinizi keşfedin
                    </p>
                    <Button 
                      onClick={() => navigate('/fortune')}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Fal Baktır
                    </Button>
                  </div>
                ) : (
                  fortunes.map((fortune, index) => (
                    <motion.div
                      key={fortune.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-card rounded-2xl p-6 shadow-mystic hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 text-accent">
                          <Sparkles className="w-5 h-5" />
                          <span className="font-semibold">
                            {new Date(fortune.timestamp).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-foreground mb-4 line-clamp-3">
                        {fortune.fortune}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedFortune(fortune)}
                          variant="outline"
                          size="sm"
                          className="border-accent/50"
                        >
                          Devamını Oku ↓
                        </Button>
                        <Button
                          onClick={() => handleDownloadFortune(fortune)}
                          variant="outline"
                          size="sm"
                          className="border-accent/50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setFortuneToDelete(fortune.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Fortune Detail Modal */}
      <Dialog open={!!selectedFortune} onOpenChange={() => setSelectedFortune(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              Falınız - {selectedFortune && new Date(selectedFortune.timestamp).toLocaleDateString('tr-TR')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedFortune?.fortune}
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => selectedFortune && handleDownloadFortune(selectedFortune)}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
            <Button
              onClick={() => {
                if (selectedFortune) {
                  setFortuneToDelete(selectedFortune.id);
                  setSelectedFortune(null);
                }
              }}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
            <Button onClick={() => setSelectedFortune(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!fortuneToDelete} onOpenChange={() => setFortuneToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Falı Sil</DialogTitle>
          </DialogHeader>
          
          <p className="text-muted-foreground">
            Bu falı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>

          <DialogFooter>
            <Button
              onClick={() => setFortuneToDelete(null)}
              variant="outline"
            >
              İptal
            </Button>
            <Button
              onClick={() => fortuneToDelete && handleDeleteFortune(fortuneToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;