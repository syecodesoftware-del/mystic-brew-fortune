import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Loader2, Moon, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getCurrentUser, updateCoins, createNotification } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';
import { cn } from '@/lib/utils';

const fortuneTellers = [
  { id: 1, name: 'Temel Rüya Okuyucu', price: 25, icon: '🌙' },
  { id: 2, name: 'Psikolojik Rüya Analisti', price: 40, icon: '🧠' },
  { id: 3, name: 'Sembolik Rüya Uzmanı', price: 55, icon: '🔮' },
  { id: 4, name: 'Ruhsal Rüya Rehberi', price: 70, icon: '✨' },
  { id: 5, name: 'Master Rüya Yorumcusu', price: 90, icon: '🌟' }
];

const emotions = [
  { value: 'mutlu', label: 'Mutlu 😊' },
  { value: 'korkmuş', label: 'Korkmuş 😨' },
  { value: 'hüzünlü', label: 'Hüzünlü 😢' },
  { value: 'heyecanlı', label: 'Heyecanlı 🤩' },
  { value: 'kaygılı', label: 'Kaygılı 😰' },
  { value: 'karışık', label: 'Karışık 😐' }
];

const ageRanges = ['18-25', '25-35', '35-45', '45-55', '55+'];
const genders = ['Kadın', 'Erkek', 'Belirtmek İstemiyorum'];
const lifeSituations = ['Öğrenci', 'Çalışıyor', 'Evli', 'Bekar', 'Emekli'];

const RuyaYorumuForm = () => {
  const { tellerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  // Rüya bilgileri
  const [dreamText, setDreamText] = useState('');
  const [dreamDate, setDreamDate] = useState<Date>();
  const [emotion, setEmotion] = useState('');
  const [recurring, setRecurring] = useState(false);

  // Kişisel bilgiler
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [lifeSituation, setLifeSituation] = useState('');

  const teller = fortuneTellers.find(t => t.id === Number(tellerId));

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      if (teller && user.coins < teller.price) {
        toast({
          title: "Yetersiz Bakiye",
          description: `Bu yorumcu için ${teller.price} altın gerekiyor.`,
          variant: "destructive"
        });
        navigate('/fortune/dream-interpretation');
      }
    };
    loadUser();
  }, [navigate, teller, toast]);

  const canProceedStep1 = dreamText.length >= 50 && dreamDate && emotion;
  const canProceedStep2 = ageRange && gender && lifeSituation;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!teller || !userId) return;

    setLoading(true);

    try {
      // Coin kontrolü ve düşme
      const user = await getCurrentUser();
      if (!user || user.coins < teller.price) {
        toast({
          title: "Yetersiz Bakiye",
          description: "Lütfen coin yükleyin.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      await updateCoins(userId, teller.price, 'spend');
      window.dispatchEvent(new Event('coinsUpdated'));

      // API isteği
      const requestData = {
        user_id: userId,
        fortune_teller_id: teller.id,
        dream_info: {
          dream_text: dreamText,
          dream_date: dreamDate ? format(dreamDate, 'yyyy-MM-dd') : '',
          emotions: emotion,
          recurring: recurring
        },
        user_info: {
          age_range: ageRange,
          gender: gender.toLowerCase(),
          life_situation: lifeSituation.toLowerCase()
        }
      };

      const response = await fetch('https://asil58.app.n8n.cloud/webhook/ruya-yorumu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Rüya yorumu alınamadı');
      }

      const result = await response.json();
      const fortuneText = result.interpretation || result.result || 'Rüya yorumunuz hazırlandı';

      // Falı kaydet
      const { error: fortuneError } = await supabase
        .from('fortunes')
        .insert({
          user_id: userId,
          fortune_text: fortuneText,
          fortune_teller_id: teller.id,
          fortune_teller_name: teller.name,
          fortune_teller_emoji: teller.icon,
          fortune_teller_cost: teller.price,
          images: {
            dream_info: {
              dream_date: dreamDate ? format(dreamDate, 'yyyy-MM-dd') : '',
              emotion: emotion,
              recurring: recurring
            },
            user_info: {
              age_range: ageRange,
              gender: gender
            }
          }
        });

      if (fortuneError) {
        console.error('Fortune kaydetme hatası:', fortuneError);
      }

      // Bildirim oluştur
      await createNotification(
        userId,
        'Rüya Yorumunuz Hazır! 🌙',
        `${teller.name} tarafından hazırlanan rüya yorumunuz sizi bekliyor!`
      );

      toast({
        title: "Başarılı! 🌟",
        description: "Rüya yorumunuz hazırlandı. Profilinizden görebilirsiniz.",
        duration: 5000
      });

      navigate('/profile');

    } catch (error) {
      console.error('Rüya yorumu hatası:', error);
      
      // Hata durumunda coin iade
      await updateCoins(userId, teller.price, 'earn');
      window.dispatchEvent(new Event('coinsUpdated'));

      toast({
        title: "Hata",
        description: "Rüya yorumu alınırken bir hata oluştu. Coin'leriniz iade edildi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!teller) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <MysticalBackground />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-white mb-2">
              {teller.icon} {teller.name}
            </h1>
            <p className="text-purple-200">Rüyanızı yorumlayalım</p>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    s === step ? "bg-purple-400 w-8" : "bg-purple-800/50"
                  )}
                />
              ))}
            </div>
          </div>

          <Card className="p-8 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm border-purple-500/30">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6">Rüya Bilgileri</h2>

                <div>
                  <Label className="text-purple-200 mb-2 block">Rüyanızı Anlatın *</Label>
                  <Textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="Rüyanızı detaylı anlatın. Nerede olduğunuzu, ne gördüğünüzü, kimlerle karşılaştığınızı ve neler hissettiğinizi yazın..."
                    className="min-h-[150px]"
                  />
                  <p className={cn(
                    "text-sm mt-2",
                    dreamText.length >= 50 ? "text-green-400" : "text-purple-300"
                  )}>
                    {dreamText.length} / 50 karakter (minimum)
                  </p>
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Rüya Tarihi *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dreamDate && "text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dreamDate ? format(dreamDate, 'PPP', { locale: tr }) : 'Tarih seçin'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dreamDate}
                        onSelect={setDreamDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Rüyada Hissettiğiniz Duygu *</Label>
                  <Select value={emotion} onValueChange={setEmotion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Duygu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {emotions.map(e => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={recurring}
                    onCheckedChange={(checked) => setRecurring(checked as boolean)}
                  />
                  <Label htmlFor="recurring" className="text-purple-200 cursor-pointer">
                    Bu rüyayı daha önce de gördüm (Tekrar eden rüya)
                  </Label>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  İleri <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6">Kişisel Bilgiler</h2>

                <div>
                  <Label className="text-purple-200 mb-2 block">Yaş Aralığı *</Label>
                  <Select value={ageRange} onValueChange={setAgeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yaş aralığı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRanges.map(age => (
                        <SelectItem key={age} value={age}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Cinsiyet *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Yaşam Durumu *</Label>
                  <Select value={lifeSituation} onValueChange={setLifeSituation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yaşam durumu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {lifeSituations.map(ls => (
                        <SelectItem key={ls} value={ls}>{ls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Geri
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    İleri <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6">Özet ve Onay</h2>

                <div className="bg-purple-900/30 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-purple-300 text-sm">Rüya Özeti</p>
                    <p className="text-white">{dreamText.substring(0, 100)}...</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Tarih</p>
                    <p className="text-white">{dreamDate && format(dreamDate, 'PPP', { locale: tr })}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Duygu</p>
                    <p className="text-white">{emotions.find(e => e.value === emotion)?.label}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Yorumcu</p>
                    <p className="text-white">{teller.icon} {teller.name}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Ücret</p>
                    <p className="text-yellow-400 font-bold">{teller.price} 💰</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Geri
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Yorumlanıyor...
                      </>
                    ) : (
                      <>Yorumla 🌙</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/fortune/dream-interpretation')}
              className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
              disabled={loading}
            >
              İptal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuyaYorumuForm;
