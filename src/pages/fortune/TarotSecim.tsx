import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Heart, Briefcase, DollarSign, Activity, Sparkles, Eye, Star, RefreshCw } from 'lucide-react';
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

// 78 Tarot Cards with Images
const TAROT_CARDS = [
  // Major Arcana (0-21)
  { id: 0, name: 'The Fool', tr: 'Deli', suit: 'major', image: '/images/tarot/00-the-fool.jpg' },
  { id: 1, name: 'The Magician', tr: 'Sihirbaz', suit: 'major', image: '/images/tarot/01-the-magician.jpg' },
  { id: 2, name: 'The High Priestess', tr: 'Yüksek Rahibe', suit: 'major', image: '/images/tarot/02-the-high-priestess.jpg' },
  { id: 3, name: 'The Empress', tr: 'İmparatoriçe', suit: 'major', image: '/images/tarot/03-the-empress.jpg' },
  { id: 4, name: 'The Emperor', tr: 'İmparator', suit: 'major', image: '/images/tarot/04-the-emperor.jpg' },
  { id: 5, name: 'The Hierophant', tr: 'Aziz', suit: 'major', image: '/images/tarot/05-the-hierophant.jpg' },
  { id: 6, name: 'The Lovers', tr: 'Aşıklar', suit: 'major', image: '/images/tarot/06-the-lovers.jpg' },
  { id: 7, name: 'The Chariot', tr: 'Savaş Arabası', suit: 'major', image: '/images/tarot/07-the-chariot.jpg' },
  { id: 8, name: 'Strength', tr: 'Güç', suit: 'major', image: '/images/tarot/08-strength.jpg' },
  { id: 9, name: 'The Hermit', tr: 'Ermiş', suit: 'major', image: '/images/tarot/09-the-hermit.jpg' },
  { id: 10, name: 'Wheel of Fortune', tr: 'Kader Çarkı', suit: 'major', image: '/images/tarot/10-wheel-of-fortune.jpg' },
  { id: 11, name: 'Justice', tr: 'Adalet', suit: 'major', image: '/images/tarot/11-justice.jpg' },
  { id: 12, name: 'The Hanged Man', tr: 'Asılan Adam', suit: 'major', image: '/images/tarot/12-the-hanged-man.jpg' },
  { id: 13, name: 'Death', tr: 'Ölüm', suit: 'major', image: '/images/tarot/13-death.jpg' },
  { id: 14, name: 'Temperance', tr: 'Denge', suit: 'major', image: '/images/tarot/14-temperance.jpg' },
  { id: 15, name: 'The Devil', tr: 'Şeytan', suit: 'major', image: '/images/tarot/15-the-devil.jpg' },
  { id: 16, name: 'The Tower', tr: 'Kule', suit: 'major', image: '/images/tarot/16-the-tower.jpg' },
  { id: 17, name: 'The Star', tr: 'Yıldız', suit: 'major', image: '/images/tarot/17-the-star.jpg' },
  { id: 18, name: 'The Moon', tr: 'Ay', suit: 'major', image: '/images/tarot/18-the-moon.jpg' },
  { id: 19, name: 'The Sun', tr: 'Güneş', suit: 'major', image: '/images/tarot/19-the-sun.jpg' },
  { id: 20, name: 'Judgement', tr: 'Yargı', suit: 'major', image: '/images/tarot/20-judgement.jpg' },
  { id: 21, name: 'The World', tr: 'Dünya', suit: 'major', image: '/images/tarot/21-the-world.jpg' },
  
  // Minor Arcana - Wands (22-35)
  { id: 22, name: 'Ace of Wands', tr: 'Asalar As', suit: 'wands', image: '/images/tarot/22-ace-of-wands.jpg' },
  { id: 23, name: 'Two of Wands', tr: 'Asalar İkili', suit: 'wands', image: '/images/tarot/23-two-of-wands.jpg' },
  { id: 24, name: 'Three of Wands', tr: 'Asalar Üçlü', suit: 'wands', image: '/images/tarot/24-three-of-wands.jpg' },
  { id: 25, name: 'Four of Wands', tr: 'Asalar Dörtlü', suit: 'wands', image: '/images/tarot/25-four-of-wands.jpg' },
  { id: 26, name: 'Five of Wands', tr: 'Asalar Beşli', suit: 'wands', image: '/images/tarot/26-five-of-wands.jpg' },
  { id: 27, name: 'Six of Wands', tr: 'Asalar Altılı', suit: 'wands', image: '/images/tarot/27-six-of-wands.jpg' },
  { id: 28, name: 'Seven of Wands', tr: 'Asalar Yedili', suit: 'wands', image: '/images/tarot/28-seven-of-wands.jpg' },
  { id: 29, name: 'Eight of Wands', tr: 'Asalar Sekizli', suit: 'wands', image: '/images/tarot/29-eight-of-wands.jpg' },
  { id: 30, name: 'Nine of Wands', tr: 'Asalar Dokuzlu', suit: 'wands', image: '/images/tarot/30-nine-of-wands.jpg' },
  { id: 31, name: 'Ten of Wands', tr: 'Asalar Onlu', suit: 'wands', image: '/images/tarot/31-ten-of-wands.jpg' },
  { id: 32, name: 'Page of Wands', tr: 'Asalar Prensi', suit: 'wands', image: '/images/tarot/32-page-of-wands.jpg' },
  { id: 33, name: 'Knight of Wands', tr: 'Asalar Şövalyesi', suit: 'wands', image: '/images/tarot/33-knight-of-wands.jpg' },
  { id: 34, name: 'Queen of Wands', tr: 'Asalar Kraliçesi', suit: 'wands', image: '/images/tarot/34-queen-of-wands.jpg' },
  { id: 35, name: 'King of Wrot', tr: 'Asalar Kralı', suit: 'wands', image: '/images/tarot/35-king-of-wands.jpg' },
  
  // Minor Arcana - Cups (36-49)
  { id: 36, name: 'Ace of Cups', tr: 'Kupalar As', suit: 'cups', image: '/images/tarot/36-ace-of-cups.jpg' },
  { id: 37, name: 'Two of Cups', tr: 'Kupalar İkili', suit: 'cups', image: '/images/tarot/37-two-of-cups.jpg' },
  { id: 38, name: 'Three of Cups', tr: 'Kupalar Üçlü', suit: 'cups', image: '/images/tarot/38-three-of-cups.jpg' },
  { id: 39, name: 'Four of Cups', tr: 'Kupalar Dörtlü', suit: 'cups', image: '/images/tarot/39-four-of-cups.jpg' },
  { id: 40, name: 'Five of Cups', tr: 'Kupalar Beşli', suit: 'cups', image: '/images/tarot/40-five-of-cups.jpg' },
  { id: 41, name: 'Six of Cups', tr: 'Kupalar Altılı', suit: 'cups', image: '/images/tarot/41-six-of-cups.jpg' },
  { id: 42, name: 'Seven of Cups', tr: 'Kupalar Yedili', suit: 'cups', image: '/images/tarot/42-seven-of-cups.jpg' },
  { id: 43, name: 'Eight of Cups', tr: 'Kupalar Sekizli', suit: 'cups', image: '/images/tarot/43-eight-of-cups.jpg' },
  { id: 44, name: 'Nine of Cups', tr: 'Kupalar Dokuzlu', suit: 'cups', image: '/images/tarot/44-nine-of-cups.jpg' },
  { id: 45, name: 'Ten of Cups', tr: 'Kupalar Onlu', suit: 'cups', image: '/images/tarot/45-ten-of-cups.jpg' },
  { id: 46, name: 'Page of Cups', tr: 'Kupalar Prensi', suit: 'cups', image: '/images/tarot/46-page-of-cups.jpg' },
  { id: 47, name: 'Knight of Cups', tr: 'Kupalar Şövalyesi', suit: 'cups', image: '/images/tarot/47-knight-of-cups.jpg' },
  { id: 48, name: 'Queen of Cups', tr: 'Kupalar Kraliçesi', suit: 'cups', image: '/images/tarot/48-queen-of-cups.jpg' },
  { id: 49, name: 'King of Cups', tr: 'Kupalar Kralı', suit: 'cups', image: '/images/tarot/49-king-of-cups.jpg' },
  
  // Minor Arcana - Swords (50-63)
  { id: 50, name: 'Ace of Swords', tr: 'Kılıçlar As', suit: 'swords', image: '/images/tarot/50-ace-of-swords.jpg' },
  { id: 51, name: 'Two of Swords', tr: 'Kılıçlar İkili', suit: 'swords', image: '/images/tarot/51-two-of-swords.jpg' },
  { id: 52, name: 'Three of Swords', tr: 'Kılıçlar Üçlü', suit: 'swords', image: '/images/tarot/52-three-of-swords.jpg' },
  { id: 53, name: 'Four of Swords', tr: 'Kılıçlar Dörtlü', suit: 'swords', image: '/images/tarot/53-four-of-swords.jpg' },
  { id: 54, name: 'Five of Swords', tr: 'Kılıçlar Beşli', suit: 'swords', image: '/images/tarot/54-five-of-swords.jpg' },
  { id: 55, name: 'Six of Swords', tr: 'Kılıçlar Altılı', suit: 'swords', image: '/images/tarot/55-six-of-swords.jpg' },
  { id: 56, name: 'Seven of Swords', tr: 'Kılıçlar Yedili', suit: 'swords', image: '/images/tarot/56-seven-of-swords.jpg' },
  { id: 57, name: 'Eight of Swords', tr: 'Kılıçlar Sekizli', suit: 'swords', image: '/images/tarot/57-eight-of-swords.jpg' },
  { id: 58, name: 'Nine of Swords', tr: 'Kılıçlar Dokuzlu', suit: 'swords', image: '/images/tarot/58-nine-of-swords.jpg' },
  { id: 59, name: 'Ten of Swords', tr: 'Kılıçlar Onlu', suit: 'swords', image: '/images/tarot/59-ten-of-swords.jpg' },
  { id: 60, name: 'Page of Swords', tr: 'Kılıçlar Prensi', suit: 'swords', image: '/images/tarot/60-page-of-swords.jpg' },
  { id: 61, name: 'Knight of Swords', tr: 'Kılıçlar Şövalyesi', suit: 'swords', image: '/images/tarot/61-knight-of-swords.jpg' },
  { id: 62, name: 'Queen of Swords', tr: 'Kılıçlar Kraliçesi', suit: 'swords', image: '/images/tarot/62-queen-of-swords.jpg' },
  { id: 63, name: 'King of Swords', tr: 'Kılıçlar Kralı', suit: 'swords', image: '/images/tarot/63-king-of-swords.jpg' },
  
  // Minor Arcana - Pentacles (64-77)
  { id: 64, name: 'Ace of Pentacles', tr: 'Tılsımlar As', suit: 'pentacles', image: '/images/tarot/64-ace-of-pentacles.jpg' },
  { id: 65, name: 'Two of Pentacles', tr: 'Tılsımlar İkili', suit: 'pentacles', image: '/images/tarot/65-two-of-pentacles.jpg' },
  { id: 66, name: 'Three of Pentacles', tr: 'Tılsımlar Üçlü', suit: 'pentacles', image: '/images/tarot/66-three-of-pentacles.jpg' },
  { id: 67, name: 'Four of Pentacles', tr: 'Tılsımlar Dörtlü', suit: 'pentacles', image: '/images/tarot/67-four-of-pentacles.jpg' },
  { id: 68, name: 'Five of Pentacles', tr: 'Tılsımlar Beşli', suit: 'pentacles', image: '/images/tarot/68-five-of-pentacles.jpg' },
  { id: 69, name: 'Six of Pentacles', tr: 'Tılsımlar Altılı', suit: 'pentacles', image: '/images/tarot/69-six-of-pentacles.jpg' },
  { id: 70, name: 'Seven of Pentacles', tr: 'Tılsımlar Yedili', suit: 'pentacles', image: '/images/tarot/70-seven-of-pentacles.jpg' },
  { id: 71, name: 'Eight of Pentacles', tr: 'Tılsımlar Sekizli', suit: 'pentacles', image: '/images/tarot/71-eight-of-pentacles.jpg' },
  { id: 72, name: 'Nine of Pentacles', tr: 'Tılsımlar Dokuzlu', suit: 'pentacles', image: '/images/tarot/72-nine-of-pentacles.jpg' },
  { id: 73, name: 'Ten of Pentacles', tr: 'Tılsımlar Onlu', suit: 'pentacles', image: '/images/tarot/73-ten-of-pentacles.jpg' },
  { id: 74, name: 'Page of Pentacles', tr: 'Tılsımlar Prensi', suit: 'pentacles', image: '/images/tarot/74-page-of-pentacles.jpg' },
  { id: 75, name: 'Knight of Pentacles', tr: 'Tılsımlar Şövalyesi', suit: 'pentacles', image: '/images/tarot/75-knight-of-pentacles.jpg' },
  { id: 76, name: 'Queen of Pentacles', tr: 'Tılsımlar Kraliçesi', suit: 'pentacles', image: '/images/tarot/76-queen-of-pentacles.jpg' },
  { id: 77, name: 'King of Pentacles', tr: 'Tılsımlar Kralı', suit: 'pentacles', image: '/images/tarot/77-king-of-pentacles.jpg' }
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
  const [fortune, setFortune] = useState('');

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
      const fortuneText = result.fortune || result.message || 'Tarot falınız hazırlandı';

      // Save fortune
      await saveFortune({
        userId: user.id,
        fortuneText: fortuneText,
        fortuneTellerId: Number(tellerId),
        fortuneTellerName: `Tarot Okuyucu ${tellerId}`,
        fortuneTellerEmoji: '🎴',
        fortuneTellerCost: tellerPrice
      });

      // Create notification
      await createNotification(user.id, 'Tarot falın hazır! 🎴', 'Kartların açıldı, yorumun seni bekliyor.', 'fortune_ready');

      toast({
        title: 'Falınız hazır! 🎴',
        description: 'Tarot falınız hazırlandı'
      });

      // Coin güncellemesi için event tetikle
      window.dispatchEvent(new Event('coinsUpdated'));

      // Yorumu göster
      setStep(4);
      setFortune(fortuneText);
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[600px] overflow-y-auto p-2">
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
                      <div className={`relative aspect-[2/3] rounded-lg border-2 transition-all overflow-hidden ${
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
                            className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-900 flex items-center justify-center"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-3xl mb-1">🌙</span>
                              <span className="text-xs text-purple-200">Tarot</span>
                            </div>
                          </div>

                          {/* Card Front with Image */}
                          <div
                            className="absolute inset-0 rounded-lg bg-white"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <img 
                              src={card.image} 
                              alt={card.tr}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                // Fallback to emoji if image doesn't load
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-purple-100 to-indigo-100">
                                      <div class="text-3xl mb-2">🎴</div>
                                      <div class="text-[10px] font-semibold text-gray-800 text-center leading-tight">
                                        ${card.tr}
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        </motion.div>

                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold shadow-lg z-10">
                            {selectedCards.indexOf(card.id) + 1}
                          </div>
                        )}
                      </div>
                      
                      {/* Card Name Below */}
                      <p className="text-center text-[10px] text-purple-200 mt-1 truncate">{card.tr}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Sonuç Ekranı */}
          {step === 4 && fortune && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-card rounded-2xl p-6 sm:p-8 shadow-mystic"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Star className="w-6 h-6 text-accent" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display">Tarot Falınız</h2>
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              
              <div className="text-center mb-4">
                <span className="text-4xl">🎴</span>
                <p className="text-muted-foreground mt-2">Tarot Okuyucu {tellerId}</p>
              </div>

              {/* Seçilen kartları göster */}
              <div className="mb-6 flex justify-center gap-4 flex-wrap">
                {selectedCards.map((cardId, index) => {
                  const card = TAROT_CARDS.find(c => c.id === cardId);
                  const positions = ['Geçmiş', 'Şimdi', 'Gelecek'];
                  return (
                    <div key={cardId} className="text-center">
                      <div className="w-24 h-36 rounded-lg overflow-hidden mb-2 shadow-xl border-2 border-purple-400/50">
                        <img 
                          src={card?.image} 
                          alt={card?.tr}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                                  <span class="text-3xl">🎴</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-accent font-semibold">{positions[index]}</p>
                      <p className="text-xs text-foreground">{card?.tr}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 mb-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {fortune}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
                <Heart className="w-4 h-4 text-accent" />
                <span>Kartların okundu</span>
                <Sparkles className="w-4 h-4 text-accent" />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/fortune/tarot')}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-3 rounded-lg font-semibold border-accent/50"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Yeni Fal
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  className="flex-1 text-sm sm:text-base py-3 rounded-lg font-semibold bg-accent hover:bg-accent/90"
                >
                  Profile Git
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {step < 4 && !fortune && (
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
        )}
      </div>
    </div>
  );
};

export default TarotSecim;
