import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit, Save, X, Download, Trash2, 
  Calendar, Clock, Eye, EyeOff, Sparkles, MapPin, Coins, Gift, Camera
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
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';

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
  const [fortuneToDelete, setFortuneToDelete] = useState<string | null>(null);
  const [canClaimBonus, setCanClaimBonus] = useState(false);
  const [timeUntilNextBonus, setTimeUntilNextBonus] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    birthDate: user?.birth_date || '',
    birthTime: user?.birth_time || '',
    city: user?.city || '',
    gender: user?.gender || '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  const [fortunes, setFortunes] = useState<Fortune[]>([]);
  
  // Load fortunes
  useEffect(() => {
    const loadFortunes = async () => {
      if (user) {
        const userFortunes = await getUserFortunes(user.id);
        setFortunes(userFortunes);
      }
    };
    loadFortunes();
  }, [user]);
  
  // Check bonus availability
  const checkBonusAvailability = () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastBonus = user.last_daily_bonus;
    
    const canClaim = !lastBonus || lastBonus !== today;
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
  useEffect(() => {
    checkBonusAvailability();
    const interval = setInterval(checkBonusAvailability, 60000);
    return () => clearInterval(interval);
  }, [user]);
  
  const handleClaimBonus = async () => {
    if (!user) return;
    
    try {
      const bonus = await checkAndGiveDailyBonus(user.id);
      if (bonus) {
        setCanClaimBonus(false);
        toast({
          title: bonus.message,
          description: `${bonus.amount} altın kazandın! 💰`,
        });
        
        window.dispatchEvent(new Event('coinsUpdated'));
        checkBonusAvailability();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bonus alınırken bir hata oluştu",
        variant: "destructive"
      });
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
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      birthDate: user?.birth_date || '',
      birthTime: user?.birth_time || '',
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
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      birthDate: user?.birth_date || '',
      birthTime: user?.birth_time || '',
      city: user?.city || '',
      gender: user?.gender || '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      if (formData.firstName.length < 2 || formData.lastName.length < 2) {
        throw new Error('Ad ve soyad en az 2 karakter olmalı');
      }

      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        city: formData.city,
        gender: formData.gender
      });
      
      setIsEditing(false);
      
      toast({
        title: "Başarılı! ✨",
        description: "Profiliniz güncellendi",
      });
      
      window.dispatchEvent(new Event('coinsUpdated'));
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: "destructive"
      });
    }
  };

  const handleDeleteFortune = async (fortuneId: string) => {
    if (!user) return;
    
    await deleteFortune(fortuneId);
    setFortuneToDelete(null);
    
    const userFortunes = await getUserFortunes(user.id);
    setFortunes(userFortunes);
    
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

  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Canvas oluştur
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Maksimum boyut 1000px
          const maxSize = 1000;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Blob'a çevir (sıkıştırılmış)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Resim işlenemedi'));
              }
            },
            'image/jpeg',
            0.8 // %80 kalite
          );
        };
        
        img.onerror = () => reject(new Error('Resim yüklenemedi'));
      };
      
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type); // DEBUG
    
    // Dosya boyutu kontrolü (5MB'a çıkardık)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Dosya çok büyük",
        description: `Fotoğraf boyutu çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum 5MB olmalı.`,
        variant: "destructive"
      });
      return;
    }
    
    // Dosya tipi kontrolü
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Geçersiz dosya",
        description: "Sadece JPG, PNG veya WEBP formatında resim yükleyebilirsiniz",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingPhoto(true);
    toast({
      title: "Yükleniyor...",
      description: "Fotoğraf yükleniyor, lütfen bekleyin",
    });
    
    try {
      // Resmi optimize et/sıkıştır
      const optimizedFile = await optimizeImage(file);
      console.log('Optimized size:', optimizedFile.size); // DEBUG
      
      // Dosya adı oluştur
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `profile_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Uploading to:', filePath); // DEBUG
      
      // Eski fotoğrafı sil (varsa)
      if (user.profile_photo) {
        try {
          const oldPath = user.profile_photo.split('profile-photos/')[1];
          if (oldPath) {
            await supabase.storage
              .from('profile-photos')
              .remove([oldPath]);
            console.log('Old photo removed'); // DEBUG
          }
        } catch (error) {
          console.log('No old photo to remove or error:', error);
        }
      }
      
      // Yeni fotoğrafı yükle
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError); // DEBUG
        throw uploadError;
      }
      
      console.log('Upload successful:', uploadData); // DEBUG
      
      // Public URL al
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log('Public URL:', publicUrl); // DEBUG
      
      // Users tablosunu güncelle
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo: publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Update error:', updateError); // DEBUG
        throw updateError;
      }
      
      // State'i güncelle
      updateUser({ ...user, profile_photo: publicUrl });
      
      toast({
        title: "Başarılı! ✨",
        description: "Profil fotoğrafı güncellendi",
      });
      
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "Hata",
        description: `Hata: ${error.message || 'Fotoğraf yüklenemedi'}`,
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      
      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* User Summary */}
          <div className="card-mystical p-8 text-center">
            {/* Profile Photo with Upload */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-cyan-400/30 shadow-lg">
                {user.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">
                      {getInitials(user.first_name, user.last_name)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Upload Button Overlay */}
              <label 
                htmlFor="photo-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploadingPhoto ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </label>
              
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 font-display">
              {user.first_name} {user.last_name}
            </h1>
            
            <p className="text-white/70 mb-4">
              Üye olma: {new Date(user.created_at).toLocaleDateString('tr-TR')}
            </p>
            
            <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">
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
                        {user.total_coins_earned || 0}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Toplam Harcanan</p>
                      <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
                        <Coins className="w-5 h-5" />
                        {user.total_coins_spent || 0}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Son Günlük Bonus</p>
                      <p className="text-sm font-medium text-gray-800">
                        {user.last_daily_bonus ? new Date(user.last_daily_bonus).toLocaleDateString('tr-TR') : 'Henüz alınmadı'}
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
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(167,139,250,0.12)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[hsl(220,13%,18%)] flex items-center gap-2 font-display">
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
                        <div className="bg-card/50 p-3 rounded-lg text-foreground">{user.first_name}</div>
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
                        <div className="bg-card/50 p-3 rounded-lg text-foreground">{user.last_name}</div>
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
                          {new Date(user.birth_date).toLocaleDateString('tr-TR')}
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
                          {user.birth_time}
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
                            {new Date(fortune.created_at).toLocaleDateString('tr-TR', {
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
                        {fortune.fortune_text}
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
              Falınız - {selectedFortune && new Date(selectedFortune.created_at).toLocaleDateString('tr-TR')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedFortune?.fortune_text}
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