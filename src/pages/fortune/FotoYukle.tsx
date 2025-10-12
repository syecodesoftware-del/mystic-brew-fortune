import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Sparkles, Moon, Star, Heart, RefreshCw, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, saveFortune, checkCoinsAndDeduct, refundCoins } from '@/lib/auth';
import { sendFortuneReadyNotification } from '@/utils/notifications';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';
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
  
  const [image, setImage] = useState<string | null>(null);
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
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

    const FORTUNE_COST = selectedTeller.cost;
    if (!checkCoinsAndDeduct(FORTUNE_COST)) {
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
      
      const fortuneId = saveFortune(fortuneResult, imageUrl);
      
      if (user && fortuneId) {
        sendFortuneReadyNotification(user.id, fortuneId);
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
      
      refundCoins(FORTUNE_COST);
      window.dispatchEvent(new Event('coinsUpdated'));
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative">
      <MysticalBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Geri Butonu */}
          {!fortune && (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/fortune/kahve')}
              className="flex items-center gap-2 text-white mb-6 hover:underline"
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
              <h2 className="text-2xl font-bold text-white mb-2">{selectedTeller.name}</h2>
              <p className="text-purple-100 mb-4">Kahve fincanı fotoğrafını yükle</p>
              <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full font-bold">
                <Coins size={20} />
                {selectedTeller.cost} altın
              </div>
            </motion.div>
          )}
          
          {/* Ana İçerik */}
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {!image && !fortune ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 bg-white/10 backdrop-blur-md ${
                    dragActive
                      ? 'border-yellow-400 bg-white/20 shadow-glow scale-105'
                      : 'border-white/50 hover:border-white/80'
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
                    <Upload className="w-16 h-16 mx-auto mb-4 text-white" />
                    <p className="text-lg text-white mb-2 font-medium">
                      Kahve fincanı fotoğrafını yükle
                    </p>
                    <p className="text-sm text-purple-200">
                      veya sürükle bırak
                    </p>
                  </label>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-xl"
                >
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <img src={logo} alt="Falcan Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-400 animate-pulse" />
                    <Moon className="absolute bottom-0 left-0 w-8 h-8 text-purple-300 animate-pulse" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {selectedTeller.name} telve okuyor... ☕✨
                  </h2>
                  <p className="text-purple-200">
                    Semboller analiz ediliyor, sabırlı ol...
                  </p>
                </motion.div>
              ) : fortune ? (
                <motion.div
                  key="fortune"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-3xl font-bold text-white">Falın Yorumu</h2>
                    <Moon className="w-6 h-6 text-purple-300" />
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="text-4xl">{selectedTeller.emoji}</span>
                    <p className="text-purple-200 mt-2">{selectedTeller.name}</p>
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

                  <div className="bg-white/20 rounded-xl p-6 mb-6">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {fortune}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-purple-200 text-sm mb-6">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Enerjin okundu</span>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>

                  <Button
                    onClick={resetFortune}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-lg py-6 rounded-xl font-bold"
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

export default FotoYukle;
