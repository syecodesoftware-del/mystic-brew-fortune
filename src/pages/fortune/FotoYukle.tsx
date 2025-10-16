import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Sparkles, Moon, Star, Heart, RefreshCw, Coins, Check, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, saveFortune, checkCoinsAndDeduct, refundCoins } from '@/lib/auth';
import { sendFortuneReadyNotification } from '@/utils/notifications';
import Header from '@/components/Header';
import logo from '@/assets/logo.png';

const WEBHOOK_URL = 'https://asil58.app.n8n.cloud/webhook/kahve-fali';

interface FortuneTeller {
  name: string;
  cost: number;
  emoji: string;
}

const fortuneTellers: Record<string, FortuneTeller> = {
  '1': { name: "Tecrübeli Falcı", cost: 10, emoji: "⭐" },
  '2': { name: "Usta Falcı", cost: 25, emoji: "🌟" },
  '3': { name: "Mistik Falcı", cost: 50, emoji: "🔮" },
  '4': { name: "Aşk Falcısı", cost: 40, emoji: "💖" },
  '5': { name: "Gelecek Falcısı", cost: 75, emoji: "✨" }
};

const FotoYukle = () => {
  const { tellerId } = useParams<{ tellerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  
  const [photos, setPhotos] = useState<{
    front: File | null;
    side: File | null;
    top: File | null;
    plate: File | null;
  }>({
    front: null,
    side: null,
    top: null,
    plate: null
  });
  
  const [previews, setPreviews] = useState<{
    front: string | null;
    side: string | null;
    top: string | null;
    plate: string | null;
  }>({
    front: null,
    side: null,
    top: null,
    plate: null
  });
  
  const [uploadStatus, setUploadStatus] = useState({
    front: false,
    side: false,
    top: false,
    plate: false
  });
  
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  
  const selectedTeller = tellerId ? fortuneTellers[tellerId] : fortuneTellers['1'];
  
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handlePhotoChange = async (type: 'front' | 'side' | 'top' | 'plate', file: File | null) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Fotoğraf boyutu 5MB'dan küçük olmalı",
        variant: "destructive"
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen geçerli bir fotoğraf seçin",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({
        ...prev,
        [type]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
    
    setPhotos(prev => ({
      ...prev,
      [type]: file
    }));
    
    setUploadStatus(prev => ({
      ...prev,
      [type]: true
    }));
    
    toast({
      title: "Fotoğraf yüklendi ✓",
    });
  };
  
  const handlePhotoRemove = (type: 'front' | 'side' | 'top' | 'plate') => {
    setPhotos(prev => ({
      ...prev,
      [type]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [type]: null
    }));
    setUploadStatus(prev => ({
      ...prev,
      [type]: false
    }));
  };
  
  const handleSubmit = async () => {
    const uploadedCount = Object.values(photos).filter(p => p !== null).length;
    
    if (uploadedCount < 3) {
      toast({
        title: "Yetersiz fotoğraf",
        description: "En az 3 fotoğraf yüklemelisiniz",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) return;
    
    const FORTUNE_COST = selectedTeller.cost;
    if (!checkCoinsAndDeduct(FORTUNE_COST)) {
      toast({
        title: "Yetersiz altın! 💰",
        description: `Fal baktırmak için ${FORTUNE_COST} altına ihtiyacın var.`,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const photoPromises = Object.entries(photos).map(async ([key, file]) => {
        if (!file) return [key, null];
        return [key, await convertImageToBase64(file)];
      });
      
      const photoResults = await Promise.all(photoPromises);
      const base64Photos = Object.fromEntries(photoResults);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: "Kahve falı yorumla - 4 fotoğraf",
          images: base64Photos,
          user_id: user.id,
          user_name: `${user.firstName} ${user.lastName}`,
          birth_date: user.birthDate,
          birth_time: user.birthTime,
          fortune_teller_id: parseInt(tellerId || '1')
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('API boş yanıt döndü');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Geçersiz API yanıtı');
      }
      
      if (data.success && data.fortune) {
        setFortune(data.fortune);
        
        const fortuneId = saveFortune(data.fortune, previews.front || undefined);
        
        if (user && fortuneId) {
          sendFortuneReadyNotification(user.id, fortuneId);
        }
        
        toast({
          title: "Falın hazır! ✨",
          description: `Telve okundu! ${FORTUNE_COST} altın harcandı.`,
        });
        
        window.dispatchEvent(new Event('coinsUpdated'));
      } else {
        throw new Error('Fal yorumu alınamadı');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Telve bulanık görünüyor, tekrar dene 🌙';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      });
      
      refundCoins(FORTUNE_COST);
      window.dispatchEvent(new Event('coinsUpdated'));
    } finally {
      setLoading(false);
    }
  };
  
  const resetFortune = () => {
    setPhotos({
      front: null,
      side: null,
      top: null,
      plate: null
    });
    setPreviews({
      front: null,
      side: null,
      top: null,
      plate: null
    });
    setUploadStatus({
      front: false,
      side: false,
      top: false,
      plate: false
    });
    setFortune('');
    setLoading(false);
  };
  
  const photoFields = [
    {
      key: 'front' as const,
      icon: '📷',
      title: 'Fincan - Ön Görünüm',
      description: 'Fincanın ön tarafını net bir şekilde çekin',
      required: true
    },
    {
      key: 'side' as const,
      icon: '📷',
      title: 'Fincan - Yan Görünüm',
      description: 'Fincanın yan tarafını net bir şekilde çekin',
      required: true
    },
    {
      key: 'top' as const,
      icon: '📷',
      title: 'Fincan - İç Kısım',
      description: 'Fincanın içini üstten net bir şekilde çekin',
      required: true
    },
    {
      key: 'plate' as const,
      icon: '🍽️',
      title: 'Tabak - Üst Görünüm',
      description: 'Tabağı üstten net bir şekilde çekin (opsiyonel)',
      required: false
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Geri Butonu */}
          {!fortune && (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/fortune/kahve')}
              className="flex items-center gap-2 text-[hsl(220,13%,18%)] mb-6 hover:underline font-medium"
            >
              <ArrowLeft size={20} />
              Falcı Seç
            </motion.button>
          )}
          
          {/* Seçili Falcı Bilgisi */}
          {!fortune && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4">{selectedTeller.emoji}</div>
              <h2 className="text-2xl font-bold text-[hsl(220,13%,18%)] mb-2 font-display">{selectedTeller.name}</h2>
              <p className="text-[hsl(220,9%,46%)] mb-4">Kahve fincanı fotoğrafını yükle</p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                <Coins size={20} />
                {selectedTeller.cost} altın
              </div>
            </motion.div>
          )}
          
          {/* Ana İçerik */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {!fortune && !loading ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Fotoğraf Yükleme Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {photoFields.map((field) => (
                      <PhotoUploadCard
                        key={field.key}
                        field={field}
                        preview={previews[field.key]}
                        uploaded={uploadStatus[field.key]}
                        onUpload={(file) => handlePhotoChange(field.key, file)}
                        onRemove={() => handlePhotoRemove(field.key)}
                      />
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-xl border border-[hsl(258,90%,76%)]/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[hsl(220,9%,46%)]">
                          Yükleme İlerlemesi
                        </span>
                        <span className="text-sm font-bold text-[hsl(258,90%,76%)]">
                          {Object.values(uploadStatus).filter(Boolean).length} / 4
                        </span>
                      </div>
                      <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${(Object.values(uploadStatus).filter(Boolean).length / 4) * 100}%` 
                          }}
                        />
                      </div>
                      {Object.values(uploadStatus).filter(Boolean).length < 3 && (
                        <p className="text-xs text-[hsl(220,9%,46%)] mt-2 text-center">
                          En az 3 fotoğraf yüklemelisiniz
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={Object.values(uploadStatus).filter(Boolean).length < 3}
                    className="
                      w-full px-8 py-5 rounded-2xl
                      bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)]
                      text-white font-bold text-lg
                      shadow-[0_4px_24px_rgba(167,139,250,0.35)]
                      hover:shadow-[0_8px_32px_rgba(167,139,250,0.5)]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-300
                      hover:-translate-y-1
                      disabled:hover:translate-y-0
                    "
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>🔮</span>
                      Falımı Yorumla
                      <span>✨</span>
                    </span>
                  </button>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-[0_8px_32px_rgba(167,139,250,0.12)]"
                >
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <img src={logo} alt="Falcan Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-[hsl(258,90%,76%)] animate-pulse" />
                    <Moon className="absolute bottom-0 left-0 w-8 h-8 text-[hsl(243,75%,59%)] animate-pulse" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-[hsl(220,13%,18%)] mb-4">
                    {selectedTeller.name} telve okuyor... ☕✨
                  </h2>
                  <p className="text-[hsl(220,9%,46%)]">
                    Semboller analiz ediliyor, sabırlı ol...
                  </p>
                </motion.div>
              ) : fortune ? (
                <motion.div
                  key="fortune"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(167,139,250,0.12)]"
                >
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-[hsl(43,96%,56%)]" />
                    <h2 className="text-3xl font-bold text-[hsl(220,13%,18%)] font-display">Falın Yorumu</h2>
                    <Moon className="w-6 h-6 text-[hsl(258,90%,76%)]" />
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="text-4xl">{selectedTeller.emoji}</span>
                    <p className="text-[hsl(220,9%,46%)] mt-2">{selectedTeller.name}</p>
                  </div>

                  {previews.front && (
                    <div className="mb-6 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm border border-[hsl(258,90%,76%)]/20 shadow-lg">
                      <img
                        src={previews.front}
                        alt="Kahve fincanı"
                        className="w-full h-64 sm:h-80 md:h-96 object-cover"
                      />
                    </div>
                  )}

                  <div className="bg-white/50 rounded-xl p-6 mb-6">
                    <p className="text-[hsl(220,13%,18%)] leading-relaxed whitespace-pre-wrap">
                      {fortune}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[hsl(220,9%,46%)] text-sm mb-6">
                    <Heart className="w-4 h-4 text-[hsl(330,81%,70%)]" />
                    <span>Enerjin okundu</span>
                    <Sparkles className="w-4 h-4 text-[hsl(258,90%,76%)]" />
                  </div>

                  <Button
                    onClick={resetFortune}
                    className="w-full text-lg py-6 rounded-xl font-bold"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Yeni Fal Bak
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

// Photo Upload Card Component
interface PhotoUploadCardProps {
  field: {
    key: 'front' | 'side' | 'top' | 'plate';
    icon: string;
    title: string;
    description: string;
    required: boolean;
  };
  preview: string | null;
  uploaded: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const PhotoUploadCard = ({ field, preview, uploaded, onUpload, onRemove }: PhotoUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div 
      className={`
        relative rounded-2xl p-6
        bg-white/70 backdrop-blur-xl
        border-2 transition-all duration-300
        ${uploaded 
          ? 'border-[hsl(258,90%,76%)]/40 shadow-[0_8px_24px_rgba(167,139,250,0.2)]' 
          : 'border-[hsl(258,90%,76%)]/20 hover:border-[hsl(258,90%,76%)]/30'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center shadow-lg">
            <span className="text-2xl">{field.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[hsl(220,13%,18%)] flex items-center gap-2">
              {field.title}
              {field.required && (
                <span className="text-xs text-[hsl(330,81%,70%)]">*</span>
              )}
            </h3>
            <p className="text-xs text-[hsl(220,9%,46%)]">
              {field.description}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        {uploaded && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
            <Check size={14} />
            <span className="text-xs font-medium">Yüklendi</span>
          </div>
        )}
      </div>
      
      {/* Upload Area */}
      <div className="relative">
        {preview ? (
          // Preview
          <div className="relative group">
            <img 
              src={preview} 
              alt={field.title}
              className="w-full h-48 object-cover rounded-xl"
            />
            
            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="
                absolute top-2 right-2
                p-2 rounded-lg
                bg-red-500 text-white
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              <X size={16} />
            </button>
            
            {/* Change Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="
                absolute bottom-2 left-1/2 -translate-x-1/2
                px-4 py-2 rounded-lg
                bg-white/90 backdrop-blur-sm text-[hsl(220,13%,18%)] text-sm font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              Değiştir
            </button>
          </div>
        ) : (
          // Upload Button
          <label className="
            flex flex-col items-center justify-center
            h-48 rounded-xl
            border-2 border-dashed border-[hsl(258,90%,76%)]/30
            bg-[hsl(258,90%,76%)]/5
            hover:bg-[hsl(258,90%,76%)]/10 hover:border-[hsl(258,90%,76%)]/50
            cursor-pointer transition-all duration-300
            group
          ">
            <Upload className="text-[hsl(258,90%,76%)] mb-3 group-hover:scale-110 transition-transform" size={32} />
            <span className="text-sm font-medium text-[hsl(220,13%,18%)] mb-1">
              Fotoğraf Yükle
            </span>
            <span className="text-xs text-[hsl(220,9%,46%)]">
              veya sürükle bırak
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && onUpload(e.target.files[0])}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default FotoYukle;
