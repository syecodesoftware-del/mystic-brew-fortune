import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, Moon, Star, Heart, RefreshCw, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { saveFortune, checkCoinsAndDeduct, refundCoins } from '@/lib/auth';
import { sendFortuneReadyNotification } from '@/utils/notifications';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';

const WEBHOOK_URL = 'https://asil58.app.n8n.cloud/webhook/kahve-fali';

const Fortune = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const analyzeFortune = async (imageFile: File) => {
    if (!user) return;

    try {
      const base64Image = await convertImageToBase64(imageFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: "Kahve falı yorumla",
          image: base64Image,
          user_id: user.id,
          user_name: `${user.first_name} ${user.last_name}`,
          birth_date: user.birth_date,
          birth_time: user.birth_time
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
        return data.fortune;
      } else {
        throw new Error('Fal yorumu alınamadı');
      }
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Fal biraz uzun sürdü, tekrar dene 🔮');
        }
        throw error;
      }
      throw new Error('Beklenmeyen bir hata oluştu');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen sadece fotoğraf yükle (JPG, PNG)",
        variant: "destructive"
      });
      return;
    }

    // Check coins before deducting
    const FORTUNE_COST = 10;
    if (!user) return;
    
    const hasEnoughCoins = await checkCoinsAndDeduct(user.id, FORTUNE_COST);
    if (!hasEnoughCoins) {
      toast({
        title: "Yetersiz altın! 💰",
        description: `Fal baktırmak için ${FORTUNE_COST} altına ihtiyacın var.`,
        variant: "destructive"
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setFortune('');
    setLoading(true);

    try {
      const fortuneResult = await analyzeFortune(file);
      setFortune(fortuneResult);
      
      if (user) {
        await saveFortune({
          userId: user.id,
          fortuneText: fortuneResult,
          fortuneTellerId: 1,
          fortuneTellerName: 'Tecrübeli Falcı',
          fortuneTellerEmoji: '⭐',
          fortuneTellerCost: FORTUNE_COST,
          images: imageUrl
        });
      }
      
      toast({
        title: "Falın hazır! ✨",
        description: `Telve okundu! ${FORTUNE_COST} altın harcandı.`,
      });
      
      window.dispatchEvent(new Event('coinsUpdated'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Telve bulanık görünüyor, tekrar dene 🌙';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      });
      setImage(null);
      
      // Refund coins on error
      if (user) {
        await refundCoins(user.id, FORTUNE_COST);
        window.dispatchEvent(new Event('coinsUpdated'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const resetFortune = () => {
    setImage(null);
    setFortune('');
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Çıkış yapıldı",
      description: "Yine bekleriz 👋",
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <SpaceBackground />
      
      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!image && !fortune ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8"
                >
                  <div className="text-8xl">✨</div>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 gradient-text">
                  Mistik Fal
                </h1>
                <p className="text-xl text-white/70 mb-12 italic">
                  Profesyonel Fal Uygulaması
                </p>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                    dragActive
                      ? 'border-cyan-400 bg-white/20 shadow-[0_25px_50px_-12px_rgba(6,182,212,0.4)] scale-105'
                      : 'border-white/30 card-mystical hover:border-white/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <p className="text-lg text-white mb-2 font-medium">
                    Kahve fincanı fotoğrafını yükle
                  </p>
                  <p className="text-sm text-white/70 mb-2">
                    veya sürükle bırak
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-amber-400">
                    <Coins className="w-5 h-5" />
                    <span className="font-semibold">Fal maliyeti: 10 altın</span>
                  </div>
                </label>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center card-mystical p-12"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center text-6xl"
                  >
                    ☕
                  </motion.div>
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-cyan-400 animate-pulse" />
                    <Moon className="absolute bottom-0 left-0 w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Telve okunuyor... ☕✨
                  </h2>
                  <p className="text-white/70">
                    Semboller analiz ediliyor, sabırlı ol...
                  </p>
              </motion.div>
            ) : fortune ? (
              <motion.div
                key="fortune"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-mystical p-8"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Star className="w-6 h-6 text-amber-400" />
                  <h2 className="text-3xl font-bold text-white font-display">Falın Yorumu</h2>
                  <Moon className="w-6 h-6 text-purple-400" />
                </div>

                {image && (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img
                      src={image}
                      alt="Kahve fincanı"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {fortune}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-6">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Enerjin okundu</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>

                <Button
                  onClick={resetFortune}
                  className="w-full text-lg py-6"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Yeni Fal Bak
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Fortune;
