import { useState, useCallback } from 'react';
import { Upload, Sparkles, Coffee, Moon, Star, Heart, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const WEBHOOK_URL = 'https://asil58.app.n8n.cloud/webhook/kahve-fali';

const CoffeeFortune = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fortune, setFortune] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

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
    try {
      const base64Image = await convertImageToBase64(imageFile);
      
      let userId = localStorage.getItem('coffee_fortune_user_id');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('coffee_fortune_user_id', userId);
      }

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
          user_id: userId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();
      
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

    setImage(URL.createObjectURL(file));
    setFortune('');
    setLoading(true);

    try {
      const fortuneResult = await analyzeFortune(file);
      setFortune(fortuneResult);
      toast({
        title: "Falın hazır! ✨",
        description: "Telve okundu, falın aşağıda...",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Telve bulanık görünüyor, tekrar dene 🌙';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      });
      setImage(null);
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
    <div className="min-h-screen bg-gradient-mystic flex items-center justify-center p-4">
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
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="mb-8"
              >
                <Coffee className="w-24 h-24 mx-auto text-accent animate-pulse-glow" />
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                Dijital Kahve Falın ✨
              </h1>
              <p className="text-xl text-muted-foreground mb-12 italic">
                Telvenin içindeki semboller bana senin enerjini fısıldıyor...
              </p>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                  dragActive
                    ? 'border-accent bg-card/50 shadow-glow scale-105'
                    : 'border-border bg-card/30 hover:border-accent/50'
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
                  <Upload className="w-16 h-16 mx-auto mb-4 text-accent" />
                  <p className="text-lg text-foreground mb-2">
                    Kahve fincanı fotoğrafını yükle
                  </p>
                  <p className="text-sm text-muted-foreground">
                    veya sürükle bırak
                  </p>
                </label>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center bg-gradient-card rounded-3xl p-12 shadow-mystic"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Coffee className="w-full h-full text-accent" />
                </motion.div>
                <Sparkles className="absolute top-0 right-0 w-8 h-8 text-accent animate-pulse" />
                <Moon className="absolute bottom-0 left-0 w-8 h-8 text-secondary animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Telve okunuyor... ☕✨
              </h2>
              <p className="text-muted-foreground">
                Semboller analiz ediliyor, sabırlı ol...
              </p>
            </motion.div>
          ) : fortune ? (
            <motion.div
              key="fortune"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-card rounded-3xl p-8 shadow-mystic"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Star className="w-6 h-6 text-accent" />
                <h2 className="text-3xl font-bold text-foreground">Falın Yorumu</h2>
                <Moon className="w-6 h-6 text-secondary" />
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

              <div className="bg-card/50 rounded-xl p-6 mb-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {fortune}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
                <Heart className="w-4 h-4 text-accent" />
                <span>Enerjin okundu</span>
                <Sparkles className="w-4 h-4 text-secondary" />
              </div>

              <Button
                onClick={resetFortune}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Yeni Fal Bak
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoffeeFortune;
