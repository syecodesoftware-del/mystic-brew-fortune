import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Heart, Briefcase, DollarSign, Activity, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUser, updateCoins, saveFortune, createNotification } from '@/lib/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import logo from '@/assets/logo.png';

const READING_TYPES = [
  { id: 'natal_chart', label: 'Doğum Haritası Analizi', emoji: '📊', description: 'En detaylı, doğum saati gerekli', requiresTime: true, requiresPlace: true },
  { id: 'sun_sign', label: 'Güneş Burcu Yorumu', emoji: '☀️', description: 'Sadece doğum tarihi yeter', requiresTime: false, requiresPlace: false },
  { id: 'daily', label: 'Günlük Burç Yorumu', emoji: '📅', description: 'Bugün için', requiresTime: false, requiresPlace: false },
  { id: 'weekly', label: 'Haftalık Burç Yorumu', emoji: '📆', description: 'Bu hafta için', requiresTime: false, requiresPlace: false },
  { id: 'monthly', label: 'Aylık Burç Yorumu', emoji: '🗓️', description: 'Bu ay için', requiresTime: false, requiresPlace: false }
];

const FOCUS_AREAS = [
  { id: 'love', label: 'Aşk ve İlişkiler', icon: Heart, emoji: '💖', gradient: 'from-pink-500 to-rose-600' },
  { id: 'career', label: 'Kariyer', icon: Briefcase, emoji: '💼', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'money', label: 'Para ve Finans', icon: DollarSign, emoji: '💰', gradient: 'from-green-500 to-emerald-600' },
  { id: 'health', label: 'Sağlık', icon: Activity, emoji: '🏥', gradient: 'from-red-500 to-orange-600' },
  { id: 'spiritual', label: 'Ruhsal Gelişim', icon: Sparkles, emoji: '🧘', gradient: 'from-purple-500 to-violet-600' },
  { id: 'general', label: 'Genel', icon: Eye, emoji: '🔮', gradient: 'from-indigo-500 to-purple-600' }
];

const ZODIAC_SIGNS = [
  { name: 'Koç', symbol: '♈', start: '03-21', end: '04-20' },
  { name: 'Boğa', symbol: '♉', start: '04-21', end: '05-21' },
  { name: 'İkizler', symbol: '♊', start: '05-22', end: '06-21' },
  { name: 'Yengeç', symbol: '♋', start: '06-22', end: '07-22' },
  { name: 'Aslan', symbol: '♌', start: '07-23', end: '08-23' },
  { name: 'Başak', symbol: '♍', start: '08-24', end: '09-23' },
  { name: 'Terazi', symbol: '♎', start: '09-24', end: '10-23' },
  { name: 'Akrep', symbol: '♏', start: '10-24', end: '11-22' },
  { name: 'Yay', symbol: '♐', start: '11-23', end: '12-21' },
  { name: 'Oğlak', symbol: '♑', start: '12-22', end: '01-20' },
  { name: 'Kova', symbol: '♒', start: '01-21', end: '02-19' },
  { name: 'Balık', symbol: '♓', start: '02-20', end: '03-20' }
];

const TELLER_PRICES: Record<number, number> = {
  1: 30,
  2: 45,
  3: 60,
  4: 75,
  5: 95
};

const calculateZodiacSign = (date: Date): { name: string; symbol: string } => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  for (const sign of ZODIAC_SIGNS) {
    const [startMonth, startDay] = sign.start.split('-').map(Number);
    const [endMonth, endDay] = sign.end.split('-').map(Number);
    
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return { name: sign.name, symbol: sign.symbol };
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return { name: sign.name, symbol: sign.symbol };
      }
    }
  }
  
  return { name: 'Bilinmiyor', symbol: '?' };
};

const YildizFaliForm = () => {
  const navigate = useNavigate();
  const { tellerId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [readingType, setReadingType] = useState('');
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fortune, setFortune] = useState('');

  const tellerPrice = TELLER_PRICES[Number(tellerId)] || 30;
  const selectedReadingType = READING_TYPES.find(t => t.id === readingType);
  const zodiacSign = birthDate ? calculateZodiacSign(birthDate) : null;

  const handleSubmit = async () => {
    if (!user || !tellerId) return;

    // Validations
    if (!readingType) {
      toast({ title: 'Yorum tipini seçmelisin', variant: 'destructive' });
      return;
    }
    if (!birthDate) {
      toast({ title: 'Doğum tarihini girmelisin', variant: 'destructive' });
      return;
    }
    if (selectedReadingType?.requiresTime && !birthTime) {
      toast({ title: 'Doğum saatini girmelisin', variant: 'destructive' });
      return;
    }
    if (selectedReadingType?.requiresPlace && !birthPlace.trim()) {
      toast({ title: 'Doğum yerini girmelisin', variant: 'destructive' });
      return;
    }
    if (!focusArea) {
      toast({ title: 'Odak alanı seçmelisin', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check and deduct coins
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast({ title: 'Kullanıcı bulunamadı', variant: 'destructive' });
        return;
      }

      if (currentUser.coins < tellerPrice) {
        toast({
          title: 'Yetersiz bakiye',
          description: `Bu astrolog için ${tellerPrice} altına ihtiyacın var`,
          variant: 'destructive'
        });
        return;
      }

      // Deduct coins
      await updateCoins(user.id, tellerPrice, 'spend');
      window.dispatchEvent(new Event('coinsUpdated'));

      toast({
        title: 'Yorum hazırlanıyor...',
        description: 'Yıldızlar okunuyor'
      });

      // Prepare API request
      const requestData: any = {
        user_id: user.id,
        fortune_teller_id: Number(tellerId),
        birth_info: {
          birth_date: format(birthDate, 'yyyy-MM-dd'),
          sun_sign: zodiacSign?.name
        },
        focus_area: focusArea,
        reading_type: readingType
      };

      // Add optional fields if provided
      if (selectedReadingType?.requiresTime && birthTime) {
        requestData.birth_info.birth_time = birthTime;
      }
      if (selectedReadingType?.requiresPlace && birthPlace) {
        requestData.birth_info.birth_place = birthPlace.trim();
      }

      const response = await fetch('https://asil58.app.n8n.cloud/webhook/yildiz-fali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Yorumunuz alınamadı');
      }

      const result = await response.json();
      const fortuneText = result.fortune || result.message || 'Yıldız yorumunuz hazırlandı';

      // Save fortune
      await saveFortune({
        userId: user.id,
        fortuneText: fortuneText,
        fortuneTellerId: Number(tellerId),
        fortuneTellerName: `Astrolog ${tellerId}`,
        fortuneTellerEmoji: '⭐',
        fortuneTellerCost: tellerPrice
      });

      // Create notification
      await createNotification(user.id, 'Yıldız yorumun hazır! ⭐', 'Doğum haritanın analiz edildi, yorumun seni bekliyor.', 'fortune_ready');

      toast({
        title: 'Yorumunuz hazır! ⭐',
        description: 'Yıldız yorumunuz hazırlandı'
      });

      window.dispatchEvent(new Event('coinsUpdated'));

      // Show result
      setStep(4);
      setFortune(fortuneText);
    } catch (error: any) {
      console.error('Yildiz fali error:', error);
      
      // Refund coins on error
      try {
        await updateCoins(user.id, tellerPrice, 'earn');
        window.dispatchEvent(new Event('coinsUpdated'));
      } catch (refundError) {
        console.error('Refund error:', refundError);
      }

      toast({
        title: 'Bir hata oluştu',
        description: error.message || 'Lütfen tekrar deneyin. Altınlarınız iade edildi.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return readingType;
    if (step === 2) {
      if (!birthDate) return false;
      if (selectedReadingType?.requiresTime && !birthTime) return false;
      if (selectedReadingType?.requiresPlace && !birthPlace.trim()) return false;
      return true;
    }
    if (step === 3) return focusArea;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate('/fortune/yildiz') : setStep(step - 1)}
            className="text-white/80 hover:text-white hover:bg-white/10"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <img src={logo} alt="Logo" className="h-10" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                  s <= step ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-yellow-200 text-sm">
            Adım {step} / 3
          </p>
        </div>

        {/* Step 1: Reading Type */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Yorum Tipini Seç</h2>
                <p className="text-yellow-200">Hangi tür astroloji yorumu istiyorsun?</p>
              </div>

              <div className="space-y-4">
                {READING_TYPES.map(type => (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setReadingType(type.id)}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                      readingType === type.id
                        ? 'border-yellow-400 bg-white/20'
                        : 'border-white/20 bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{type.emoji}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{type.label}</h3>
                        <p className="text-sm text-white/70">{type.description}</p>
                        {type.requiresTime && (
                          <p className="text-xs text-yellow-300 mt-2">⚠️ Doğum saati ve yeri gereklidir</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Birth Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Doğum Bilgilerin</h2>
                <p className="text-yellow-200">Yıldızların sana özel mesajı için</p>
              </div>

              <div className="space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-white">Doğum Tarihi *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/80",
                          !birthDate && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'dd MMMM yyyy') : <span>Tarih seç</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Zodiac Sign Display */}
                {zodiacSign && (
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{zodiacSign.symbol}</div>
                      <div>
                        <p className="text-sm text-white/70">Güneş Burcun</p>
                        <p className="text-xl font-bold text-white">{zodiacSign.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Birth Time (conditional) */}
                {selectedReadingType?.requiresTime && (
                  <div className="space-y-2">
                    <Label htmlFor="birthTime" className="text-white">Doğum Saati *</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="bg-white/80"
                    />
                    <p className="text-xs text-yellow-300">Doğum haritası için saat bilgisi önemlidir</p>
                  </div>
                )}

                {/* Birth Place (conditional) */}
                {selectedReadingType?.requiresPlace && (
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace" className="text-white">Doğum Yeri *</Label>
                    <Input
                      id="birthPlace"
                      type="text"
                      placeholder="Örn: İstanbul, Türkiye"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="bg-white/80"
                    />
                    <p className="text-xs text-yellow-300">Doğum haritası için yer bilgisi gereklidir</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Focus Area */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Odak Alanını Seç</h2>
                <p className="text-yellow-200">Hangi alanda yıldızlardan rehberlik istiyorsun?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FOCUS_AREAS.map(area => {
                  const IconComponent = area.icon;
                  return (
                    <motion.div
                      key={area.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFocusArea(area.id)}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                        focusArea === area.id
                          ? 'border-yellow-400 bg-white/20'
                          : 'border-white/20 bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${area.gradient} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-center text-white font-medium">{area.label}</p>
                      <p className="text-center text-2xl mt-2">{area.emoji}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && fortune && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-2xl shadow-yellow-500/50">
                  <span className="text-4xl">⭐</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Yıldız Yorumun Hazır!</h2>
                <p className="text-yellow-200">Kozmik mesajın burada</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{fortune}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate('/profile')}
                  className="flex-1"
                  size="lg"
                >
                  Profile Git
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate('/fortune/yildiz')}
                  variant="secondary"
                  size="lg"
                >
                  Yeni Yorum
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isSubmitting}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || isSubmitting}
                size="lg"
              >
                İleri
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yorumlanıyor...
                  </>
                ) : (
                  <>
                    Yorumla ({tellerPrice} coin)
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="text-8xl"
              >
                🌌
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Yıldızlar Okunuyor...</h3>
                <p className="text-white/70">Kozmik mesajın hazırlanıyor</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YildizFaliForm;
