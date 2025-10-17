import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Sparkles, Moon, Star, Heart, RefreshCw, Coins, Check, X, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { saveFortune, checkCoinsAndDeduct, refundCoins } from '@/lib/auth';
import { sendFortuneReadyNotification } from '@/utils/notifications';
import Header from '@/components/Header';
import logo from '@/assets/logo.png';

const WEBHOOK_URL = 'https://asil58.app.n8n.cloud/webhook/kahve-fali';

interface FortuneTeller {
  id: number;
  name: string;
  cost: number;
  emoji: string;
}

const fortuneTellers: Record<string, FortuneTeller> = {
  '1': { id: 1, name: "Tecrübeli Falcı", cost: 10, emoji: "⭐" },
  '2': { id: 2, name: "Usta Falcı", cost: 25, emoji: "🌟" },
  '3': { id: 3, name: "Mistik Falcı", cost: 50, emoji: "🔮" },
  '4': { id: 4, name: "Aşk Falcısı", cost: 40, emoji: "💖" },
  '5': { id: 5, name: "Gelecek Falcısı", cost: 75, emoji: "✨" }
};

const FotoYukle = () => {
  const { tellerId } = useParams<{ tellerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [type]: reader.result as string
        }));
      };
      reader.onerror = () => {
        toast({
          title: "Hata",
          description: "Fotoğraf yüklenemedi, lütfen tekrar deneyin",
          variant: "destructive"
        });
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
    } catch (error) {
      toast({
        title: "Hata",
        description: "Fotoğraf işlenemedi",
        variant: "destructive"
      });
    }
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
    const hasEnoughCoins = await checkCoinsAndDeduct(user.id, FORTUNE_COST);
    if (!hasEnoughCoins) {
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
          user_name: `${user.first_name} ${user.last_name}`,
          birth_date: user.birth_date,
          birth_time: user.birth_time,
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
        
        await saveFortune({
          userId: user.id,
          fortuneText: data.fortune,
          fortuneTellerId: selectedTeller.id || 1,
          fortuneTellerName: selectedTeller.name,
          fortuneTellerEmoji: selectedTeller.emoji,
          fortuneTellerCost: FORTUNE_COST,
          images: base64Photos
        });
        
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
      
      if (user) {
        await refundCoins(user.id, FORTUNE_COST);
        window.dispatchEvent(new Event('coinsUpdated'));
      }
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
      title: 'Ön',
      required: true
    },
    {
      key: 'side' as const,
      icon: '📷',
      title: 'Yan',
      required: true
    },
    {
      key: 'top' as const,
      icon: '📷',
      title: 'İç',
      required: true
    },
    {
      key: 'plate' as const,
      icon: '🍽️',
      title: 'Tabak',
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
              <ArrowLeft size={18} />
              <span className="text-sm">Geri</span>
            </motion.button>
          )}
          
          {/* Seçili Falcı Bilgisi - Kompakt */}
          {!fortune && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-[hsl(258,90%,76%)]/20">
                <span className="text-3xl">{selectedTeller.emoji}</span>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-[hsl(220,13%,18%)]">
                    {selectedTeller.name}
                  </h2>
                  <div className="flex items-center gap-1 text-sm">
                    <Coins size={14} />
                    <span className="font-semibold text-[hsl(43,96%,56%)]">{selectedTeller.cost} altın</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Açıklama - Kompakt */}
          {!fortune && !loading && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="rounded-xl p-4 bg-white/60 backdrop-blur-md border border-[hsl(258,90%,76%)]/15">
                <p className="text-sm text-[hsl(220,9%,46%)] text-center">
                  📸 Fincanını <span className="font-semibold text-[hsl(220,13%,18%)]">4 farklı açıdan</span> çek • En az <span className="font-semibold text-[hsl(258,90%,76%)]">3 fotoğraf</span> gerekli
                </p>
              </div>
            </div>
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
                  {/* Fotoğraf Yükleme Grid - KOMPAKT */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {photoFields.map((field) => (
                      <CompactPhotoCard
                        key={field.key}
                        field={field}
                        preview={previews[field.key]}
                        uploaded={uploadStatus[field.key]}
                        onUpload={(file) => handlePhotoChange(field.key, file)}
                        onRemove={() => handlePhotoRemove(field.key)}
                      />
                    ))}
                  </div>
                  
                  {/* Progress Bar - Kompakt */}
                  <div className="mb-6">
                    <div className="rounded-xl p-4 bg-white/60 backdrop-blur-md border border-[hsl(258,90%,76%)]/15">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] transition-all duration-500"
                              style={{ 
                                width: `${(Object.values(uploadStatus).filter(Boolean).length / 4) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[hsl(258,90%,76%)] whitespace-nowrap">
                          {Object.values(uploadStatus).filter(Boolean).length}/4
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={Object.values(uploadStatus).filter(Boolean).length < 3}
                    className="
                      w-full px-8 py-4 rounded-xl
                      bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)]
                      text-white font-bold text-base
                      shadow-lg hover:shadow-xl
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-300
                      hover:-translate-y-0.5
                      disabled:hover:translate-y-0
                    "
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Yorumlanıyor...
                      </span>
                    ) : (
                      '🔮 Falımı Yorumla'
                    )}
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

// Kompakt Photo Card Component
interface CompactPhotoCardProps {
  field: {
    key: 'front' | 'side' | 'top' | 'plate';
    icon: string;
    title: string;
    required: boolean;
  };
  preview: string | null;
  uploaded: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const CompactPhotoCard = ({ field, preview, uploaded, onUpload, onRemove }: CompactPhotoCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showSheet, setShowSheet] = useState(false);
  
  const handleFileSelect = (file: File | null) => {
    if (file) {
      onUpload(file);
      setShowSheet(false);
    }
  };
  
  return (
    <>
      <div 
        className={`
          relative rounded-xl overflow-hidden
          transition-all duration-300
          ${uploaded 
            ? 'ring-2 ring-[hsl(258,90%,76%)]/40 shadow-lg' 
            : 'border-2 border-dashed border-[hsl(258,90%,76%)]/20'
          }
        `}
      >
        {preview ? (
          // Preview Mode
          <div className="relative group aspect-square">
            <img 
              src={preview} 
              alt={field.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => setShowSheet(true)}
                className="px-4 py-2 rounded-lg bg-white/90 hover:bg-white transition-colors text-sm font-medium text-[hsl(220,13%,18%)]"
              >
                Değiştir
              </button>
              <button
                onClick={onRemove}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-sm font-medium text-white"
              >
                Sil
              </button>
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
              <Check size={12} className="text-white" />
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs font-medium text-white text-center">
                {field.title}
              </p>
            </div>
          </div>
        ) : (
          // Upload Button
          <button
            onClick={() => setShowSheet(true)}
            className="w-full aspect-square flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              {field.icon}
            </div>
            <p className="text-sm font-semibold text-[hsl(220,13%,18%)] mb-1">
              {field.title}
            </p>
            <p className="text-xs text-[hsl(258,90%,76%)] font-medium">
              + Ekle
            </p>
          </button>
        )}
        
        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />
        
        {/* Required Indicator */}
        {field.required && !uploaded && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-[hsl(330,81%,70%)] rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Bottom Sheet Overlay */}
      {showSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSheet(false)}
        >
          {/* Bottom Sheet Content */}
          <div 
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            {/* Title */}
            <h3 className="text-lg font-bold text-[hsl(220,13%,18%)] text-center mb-6">
              {field.title} - Fotoğraf Ekle
            </h3>
            
            {/* Options */}
            <div className="space-y-3 mb-4">
              {/* Camera Option */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] text-white hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Fotoğraf Çek</p>
                  <p className="text-xs text-white/80">Kameranı aç ve çek</p>
                </div>
              </button>
              
              {/* Gallery Option */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-[hsl(258,90%,76%)]/20 hover:bg-[hsl(258,90%,76%)]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(258,90%,76%)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} className="text-[hsl(258,90%,76%)]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-[hsl(220,13%,18%)]">Galeriden Seç</p>
                  <p className="text-xs text-[hsl(220,9%,46%)]">Mevcut fotoğraflardan seç</p>
                </div>
              </button>
            </div>
            
            {/* Cancel Button */}
            <button
              onClick={() => setShowSheet(false)}
              className="w-full py-3 rounded-xl text-[hsl(220,9%,46%)] font-medium hover:bg-gray-100 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FotoYukle;
