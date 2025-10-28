import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Heart, Briefcase, DollarSign, Activity, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUser, updateCoins, saveFortune, createNotification } from '@/lib/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import logo from '@/assets/logo.png';

// 78 Tarot Cards
const TAROT_CARDS = [
  // Major Arcana (0-21)
  { id: 0, name: 'The Fool', tr: 'Deli', suit: 'major' },
  { id: 1, name: 'The Magician', tr: 'Sihirbaz', suit: 'major' },
  { id: 2, name: 'The High Priestess', tr: 'Yüksek Rahibe', suit: 'major' },
  { id: 3, name: 'The Empress', tr: 'İmparatoriçe', suit: 'major' },
  { id: 4, name: 'The Emperor', tr: 'İmparator', suit: 'major' },
  { id: 5, name: 'The Hierophant', tr: 'Aziz', suit: 'major' },
  { id: 6, name: 'The Lovers', tr: 'Aşıklar', suit: 'major' },
  { id: 7, name: 'The Chariot', tr: 'Savaş Arabası', suit: 'major' },
  { id: 8, name: 'Strength', tr: 'Güç', suit: 'major' },
  { id: 9, name: 'The Hermit', tr: 'Ermiş', suit: 'major' },
  { id: 10, name: 'Wheel of Fortune', tr: 'Kader Çarkı', suit: 'major' },
  { id: 11, name: 'Justice', tr: 'Adalet', suit: 'major' },
  { id: 12, name: 'The Hanged Man', tr: 'Asılan Adam', suit: 'major' },
  { id: 13, name: 'Death', tr: 'Ölüm', suit: 'major' },
  { id: 14, name: 'Temperance', tr: 'Denge', suit: 'major' },
  { id: 15, name: 'The Devil', tr: 'Şeytan', suit: 'major' },
  { id: 16, name: 'The Tower', tr: 'Kule', suit: 'major' },
  { id: 17, name: 'The Star', tr: 'Yıldız', suit: 'major' },
  { id: 18, name: 'The Moon', tr: 'Ay', suit: 'major' },
  { id: 19, name: 'The Sun', tr: 'Güneş', suit: 'major' },
  { id: 20, name: 'Judgement', tr: 'Yargı', suit: 'major' },
  { id: 21, name: 'The World', tr: 'Dünya', suit: 'major' },
  
  // Minor Arcana - Wands (22-35)
  { id: 22, name: 'Ace of Wands', tr: 'Asalar As', suit: 'wands', emoji: '🔥' },
  { id: 23, name: 'Two of Wands', tr: 'Asalar İkili', suit: 'wands', emoji: '🔥' },
  { id: 24, name: 'Three of Wands', tr: 'Asalar Üçlü', suit: 'wands', emoji: '🔥' },
  { id: 25, name: 'Four of Wands', tr: 'Asalar Dörtlü', suit: 'wands', emoji: '🔥' },
  { id: 26, name: 'Five of Wands', tr: 'Asalar Beşli', suit: 'wands', emoji: '🔥' },
  { id: 27, name: 'Six of Wands', tr: 'Asalar Altılı', suit: 'wands', emoji: '🔥' },
  { id: 28, name: 'Seven of Wands', tr: 'Asalar Yedili', suit: 'wands', emoji: '🔥' },
  { id: 29, name: 'Eight of Wands', tr: 'Asalar Sekizli', suit: 'wands', emoji: '🔥' },
  { id: 30, name: 'Nine of Wands', tr: 'Asalar Dokuzlu', suit: 'wands', emoji: '🔥' },
  { id: 31, name: 'Ten of Wands', tr: 'Asalar Onlu', suit: 'wands', emoji: '🔥' },
  { id: 32, name: 'Page of Wands', tr: 'Asalar Prensi', suit: 'wands', emoji: '🔥' },
  { id: 33, name: 'Knight of Wands', tr: 'Asalar Şövalyesi', suit: 'wands', emoji: '🔥' },
  { id: 34, name: 'Queen of Wands', tr: 'Asalar Kraliçesi', suit: 'wands', emoji: '🔥' },
  { id: 35, name: 'King of Wands', tr: 'Asalar Kralı', suit: 'wands', emoji: '🔥' },
  
  // Minor Arcana - Cups (36-49)
  { id: 36, name: 'Ace of Cups', tr: 'Kupalar As', suit: 'cups', emoji: '💧' },
  { id: 37, name: 'Two of Cups', tr: 'Kupalar İkili', suit: 'cups', emoji: '💧' },
  { id: 38, name: 'Three of Cups', tr: 'Kupalar Üçlü', suit: 'cups', emoji: '💧' },
  { id: 39, name: 'Four of Cups', tr: 'Kupalar Dörtlü', suit: 'cups', emoji: '💧' },
  { id: 40, name: 'Five of Cups', tr: 'Kupalar Beşli', suit: 'cups', emoji: '💧' },
  { id: 41, name: 'Six of Cups', tr: 'Kupalar Altılı', suit: 'cups', emoji: '💧' },
  { id: 42, name: 'Seven of Cups', tr: 'Kupalar Yedili', suit: 'cups', emoji: '💧' },
  { id: 43, name: 'Eight of Cups', tr: 'Kupalar Sekizli', suit: 'cups', emoji: '💧' },
  { id: 44, name: 'Nine of Cups', tr: 'Kupalar Dokuzlu', suit: 'cups', emoji: '💧' },
  { id: 45, name: 'Ten of Cups', tr: 'Kupalar Onlu', suit: 'cups', emoji: '💧' },
  { id: 46, name: 'Page of Cups', tr: 'Kupalar Prensi', suit: 'cups', emoji: '💧' },
  { id: 47, name: 'Knight of Cups', tr: 'Kupalar Şövalyesi', suit: 'cups', emoji: '💧' },
  { id: 48, name: 'Queen of Cups', tr: 'Kupalar Kraliçesi', suit: 'cups', emoji: '💧' },
  { id: 49, name: 'King of Cups', tr: 'Kupalar Kralı', suit: 'cups', emoji: '💧' },
  
  // Minor Arcana - Swords (50-63)
  { id: 50, name: 'Ace of Swords', tr: 'Kılıçlar As', suit: 'swords', emoji: '⚔️' },
  { id: 51, name: 'Two of Swords', tr: 'Kılıçlar İkili', suit: 'swords', emoji: '⚔️' },
  { id: 52, name: 'Three of Swords', tr: 'Kılıçlar Üçlü', suit: 'swords', emoji: '⚔️' },
  { id: 53, name: 'Four of Swords', tr: 'Kılıçlar Dörtlü', suit: 'swords', emoji: '⚔️' },
  { id: 54, name: 'Five of Swords', tr: 'Kılıçlar Beşli', suit: 'swords', emoji: '⚔️' },
  { id: 55, name: 'Six of Swords', tr: 'Kılıçlar Altılı', suit: 'swords', emoji: '⚔️' },
  { id: 56, name: 'Seven of Swords', tr: 'Kılıçlar Yedili', suit: 'swords', emoji: '⚔️' },
  { id: 57, name: 'Eight of Swords', tr: 'Kılıçlar Sekizli', suit: 'swords', emoji: '⚔️' },
  { id: 58, name: 'Nine of Swords', tr: 'Kılıçlar Dokuzlu', suit: 'swords', emoji: '⚔️' },
  { id: 59, name: 'Ten of Swords', tr: 'Kılıçlar Onlu', suit: 'swords', emoji: '⚔️' },
  { id: 60, name: 'Page of Swords', tr: 'Kılıçlar Prensi', suit: 'swords', emoji: '⚔️' },
  { id: 61, name: 'Knight of Swords', tr: 'Kılıçlar Şövalyesi', suit: 'swords', emoji: '⚔️' },
  { id: 62, name: 'Queen of Swords', tr: 'Kılıçlar Kraliçesi', suit: 'swords', emoji: '⚔️' },
  { id: 63, name: 'King of Swords', tr: 'Kılıçlar Kralı', suit: 'swords', emoji: '⚔️' },
  
  // Minor Arcana - Pentacles (64-77)
  { id: 64, name: 'Ace of Pentacles', tr: 'Tılsımlar As', suit: 'pentacles', emoji: '💎' },
  { id: 65, name: 'Two of Pentacles', tr: 'Tılsımlar İkili', suit: 'pentacles', emoji: '💎' },
  { id: 66, name: 'Three of Pentacles', tr: 'Tılsımlar Üçlü', suit: 'pentacles', emoji: '💎' },
  { id: 67, name: 'Four of Pentacles', tr: 'Tılsımlar Dörtlü', suit: 'pentacles', emoji: '💎' },
  { id: 68, name: 'Five of Pentacles', tr: 'Tılsımlar Beşli', suit: 'pentacles', emoji: '💎' },
  { id: 69, name: 'Six of Pentacles', tr: 'Tılsımlar Altılı', suit: 'pentacles', emoji: '💎' },
  { id: 70, name: 'Seven of Pentacles', tr: 'Tılsımlar Yedili', suit: 'pentacles', emoji: '💎' },
  { id: 71, name: 'Eight of Pentacles', tr: 'Tılsımlar Sekizli', suit: 'pentacles', emoji: '💎' },
  { id: 72, name: 'Nine of Pentacles', tr: 'Tılsımlar Dokuzlu', suit: 'pentacles', emoji: '💎' },
  { id: 73, name: 'Ten of Pentacles', tr: 'Tılsımlar Onlu', suit: 'pentacles', emoji: '💎' },
  { id: 74, name: 'Page of Pentacles', tr: 'Tılsımlar Prensi', suit: 'pentacles', emoji: '💎' },
  { id: 75, name: 'Knight of Pentacles', tr: 'Tılsımlar Şövalyesi', suit: 'pentacles', emoji: '💎' },
  { id: 76, name: 'Queen of Pentacles', tr: 'Tılsımlar Kraliçesi', suit: 'pentacles', emoji: '💎' },
  { id: 77, name: 'King of Pentacles', tr: 'Tılsımlar Kralı', suit: 'pentacles', emoji: '💎' }
];

const FOCUS_AREAS = [
  { id: 'love', label: 'Aşk ve İlişkiler', icon: Heart, emoji: '💖', gradient: 'from-pink-500 to-rose-600' },
  { id: 'career', label: 'Kariyer ve İş', icon: Briefcase, emoji: '💼', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'money', label: 'Para ve Finans', icon: DollarSign, emoji: '💰', gradient: 'from-green-500 to-emerald-600' },
  { id: 'health', label: 'Sağlık', icon: Activity, emoji: '🏥', gradient: 'from-red-500 to-orange-600' },
  { id: 'spiritual', label: 'Ruhsal Gelişim', icon: Sparkles, emoji: '🧘', gradient: 'from-purple-500 to-violet-600' },
  { id: 'general', label: 'Genel', icon: Eye, emoji: '🔮', gradient: 'from-indigo-500 to-purple-600' }
];

const RELATIONSHIP_STATUSES = [
  { value: 'single', label: 'Bekar' },
  { value: 'in_relationship', label: 'İlişkide' },
  { value: 'married', label: 'Evli' },
  { value: 'complicated', label: 'Karmaşık' },
  { value: 'divorced', label: 'Boşanmış' }
];

const TELLER_PRICES: Record<number, number> = {
  1: 35,
  2: 45,
  3: 55,
  4: 70,
  5: 90
};

const TarotSecim = () => {
  const navigate = useNavigate();
  const { tellerId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [focusArea, setFocusArea] = useState('');
  const [birthDate, setBirthDate] = useState<Date>();
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [occupation, setOccupation] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tellerPrice = TELLER_PRICES[Number(tellerId)] || 35;

  const handleCardClick = (cardId: number) => {
    // Flip animation
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(cardId);
      return newSet;
    });

    // Select card
    setTimeout(() => {
      if (selectedCards.includes(cardId)) {
        setSelectedCards(prev => prev.filter(id => id !== cardId));
      } else if (selectedCards.length < 3) {
        setSelectedCards(prev => [...prev, cardId]);
      } else {
        toast({
          title: 'En fazla 3 kart seçebilirsin',
          description: 'Lütfen önce bir kartın seçimini kaldır',
          variant: 'destructive'
        });
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user || !tellerId) return;

    // Validations
    if (!focusArea) {
      toast({ title: 'Odak alanı seçmelisin', variant: 'destructive' });
      return;
    }
    if (!birthDate) {
      toast({ title: 'Doğum tarihini girmelisin', variant: 'destructive' });
      return;
    }
    if (!relationshipStatus) {
      toast({ title: 'İlişki durumunu seçmelisin', variant: 'destructive' });
      return;
    }
    if (!occupation.trim()) {
      toast({ title: 'Mesleğini girmelisin', variant: 'destructive' });
      return;
    }
    if (selectedCards.length !== 3) {
      toast({ title: '3 kart seçmelisin', variant: 'destructive' });
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
          description: `Bu falcı için ${tellerPrice} altına ihtiyacın var`,
          variant: 'destructive'
        });
        return;
      }

      // Deduct coins
      await updateCoins(user.id, tellerPrice, 'spend');
      window.dispatchEvent(new Event('coinsUpdated'));

      toast({
        title: 'Falın hazırlanıyor...',
        description: 'Lütfen bekleyin'
      });

      // Prepare selected cards data
      const positions = ['past', 'present', 'future'];
      const selectedCardsData = selectedCards.map((cardId, index) => {
        const card = TAROT_CARDS.find(c => c.id === cardId)!;
        return {
          id: card.id,
          name: card.name,
          tr: card.tr,
          position: positions[index]
        };
      });

      // API request
      const requestData = {
        user_id: user.id,
        fortune_teller_id: Number(tellerId),
        focus_area: focusArea,
        user_info: {
          birth_date: format(birthDate, 'yyyy-MM-dd'),
          relationship_status: relationshipStatus,
          occupation: occupation.trim()
        },
        selected_cards: selectedCardsData
      };

      const response = await fetch('https://asil58.app.n8n.cloud/webhook/tarot-fali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Falınız alınamadı');
      }

      const result = await response.json();

      // Save fortune
      await saveFortune({
        userId: user.id,
        fortuneText: result.fortune || result.message || 'Tarot falınız',
        fortuneTellerId: Number(tellerId),
        fortuneTellerName: `Tarot Okuyucu ${tellerId}`,
        fortuneTellerEmoji: '🎴',
        fortuneTellerCost: tellerPrice
      });

      // Create notification
      await createNotification(user.id, 'Tarot falın hazır! 🎴', 'Kartların açıldı, yorumun seni bekliyor.', 'fortune_ready');

      toast({
        title: 'Falınız hazır! 🎴',
        description: 'Profilinizden görüntüleyebilirsiniz'
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Tarot error:', error);
      
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
    if (step === 1) return focusArea;
    if (step === 2) return birthDate && relationshipStatus && occupation.trim();
    if (step === 3) return selectedCards.length === 3;
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
            onClick={() => step === 1 ? navigate('/fortune/tarot') : setStep(step - 1)}
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
                  s <= step ? 'bg-gradient-to-r from-purple-400 to-indigo-600' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-purple-200 text-sm">
            Adım {step} / 3
          </p>
        </div>

        {/* Step 1: Focus Area */}
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
                <h2 className="text-3xl font-bold text-white mb-2">Odak Alanını Seç</h2>
                <p className="text-purple-200">Hangi alanda yol göstericiye ihtiyacın var?</p>
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
                          ? 'border-purple-400 bg-white/20'
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

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Kişisel Bilgiler</h2>
                <p className="text-purple-200">Falını kişiselleştirmek için birkaç bilgiye ihtiyacımız var</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-6">
                {/* Birth Date */}
                <div className="space-y-2">
                  <Label className="text-white">Doğum Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20',
                          !birthDate && 'text-purple-300'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'dd/MM/yyyy') : 'Tarih seç'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        initialFocus
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Relationship Status */}
                <div className="space-y-2">
                  <Label className="text-white">İlişki Durumu</Label>
                  <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Durum seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <Label className="text-white">Meslek</Label>
                  <Input
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Örn: Öğrenci, Mühendis, Öğretmen..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Card Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Kartlarını Seç</h2>
                <p className="text-purple-200">3 kart seç: Geçmiş • Şimdi • Gelecek</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="px-4 py-2 rounded-full bg-purple-500/30 text-white font-semibold">
                    {selectedCards.length} / 3 kart seçildi
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[500px] overflow-y-auto p-2">
                {TAROT_CARDS.map(card => {
                  const isFlipped = flippedCards.has(card.id);
                  const isSelected = selectedCards.includes(card.id);
                  
                  return (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardClick(card.id)}
                      className="cursor-pointer"
                    >
                      <div className={`relative aspect-[2/3] rounded-lg border-2 transition-all ${
                        isSelected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-purple-400/30'
                      }`}>
                        <motion.div
                          className="w-full h-full"
                          initial={false}
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* Card Back */}
                          <div
                            className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <span className="text-2xl">🌙</span>
                          </div>

                          {/* Card Front */}
                          <div
                            className="absolute inset-0 rounded-lg bg-white/95 flex flex-col items-center justify-center p-2 text-center"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div className="text-lg mb-1">{card.emoji || '🎴'}</div>
                            <div className="text-[8px] font-semibold text-gray-800 leading-tight">
                              {card.tr}
                            </div>
                          </div>
                        </motion.div>

                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                            {selectedCards.indexOf(card.id) + 1}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm text-purple-200">Falcı ücreti</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{tellerPrice}</span>
              <span className="text-yellow-400">coin</span>
            </div>
          </div>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Falıma Bak 🎴'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarotSecim;
