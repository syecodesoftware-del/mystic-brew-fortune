import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, X, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import SpaceBackground from '@/components/SpaceBackground';
import Header from '@/components/Header';
import { getCurrentUser, updateCoins, saveFortune, createNotification } from '@/lib/auth';

interface FortuneTeller {
  name: string;
  cost: number;
  emoji: string;
}

interface PhotoData {
  file: File | null;
  preview: string;
}

interface PersonInfo {
  name: string;
  birthDate: string;
  zodiacSign: string;
  fincan: PhotoData;
  tabak: PhotoData;
}

const CiftFaliForm = () => {
  const { tellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [focusArea, setFocusArea] = useState('');
  const [person1, setPerson1] = useState<PersonInfo>({
    name: '',
    birthDate: '',
    zodiacSign: '',
    fincan: { file: null, preview: '' },
    tabak: { file: null, preview: '' }
  });
  const [person2, setPerson2] = useState<PersonInfo>({
    name: '',
    birthDate: '',
    zodiacSign: '',
    fincan: { file: null, preview: '' },
    tabak: { file: null, preview: '' }
  });
  const [relationshipDuration, setRelationshipDuration] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fortune, setFortune] = useState('');

  const fortuneTellers: Record<number, FortuneTeller> = {
    1: { name: "Temel Çift Okuyucu", cost: 40, emoji: "💑" },
    2: { name: "Aşk Uyumluluk Uzmanı", cost: 55, emoji: "💖" },
    3: { name: "İlişki Danışmanı", cost: 70, emoji: "💞" },
    4: { name: "Astrolojik Çift Analisti", cost: 85, emoji: "⭐" },
    5: { name: "Master İlişki Rehberi", cost: 100, emoji: "✨" }
  };

  const selectedTeller = fortuneTellers[Number(tellerId)];

  const zodiacSigns = [
    'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
    'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'
  ];

  const focusAreas = [
    { value: 'compatibility', label: 'Uyumluluk', emoji: '💑' },
    { value: 'future', label: 'Gelecek', emoji: '🔮' },
    { value: 'challenges', label: 'Zorluklar', emoji: '⚠️' },
    { value: 'strengths', label: 'Güçlü Yönler', emoji: '💪' }
  ];

  const relationshipTypes = [
    { value: 'dating', label: 'Flört' },
    { value: 'relationship', label: 'Sevgili' },
    { value: 'engaged', label: 'Nişanlı' },
    { value: 'married', label: 'Evli' },
    { value: 'complicated', label: 'Karmaşık' }
  ];

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = (
    person: 'person1' | 'person2',
    type: 'fincan' | 'tabak',
    file: File | null
  ) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz dosya!",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive"
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    
    if (person === 'person1') {
      setPerson1(prev => ({
        ...prev,
        [type]: { file, preview }
      }));
    } else {
      setPerson2(prev => ({
        ...prev,
        [type]: { file, preview }
      }));
    }
  };

  const canProceedStep1 = focusArea !== '';
  const canProceedStep2 = person1.name && person1.birthDate && person1.zodiacSign && 
                          person1.fincan.file && person1.tabak.file;
  const canProceedStep3 = person2.name && person2.birthDate && person2.zodiacSign && 
                          person2.fincan.file && person2.tabak.file;
  const canProceedStep4 = relationshipDuration && relationshipType;

  const handleSubmit = async () => {
    if (!user || !selectedTeller) return;

    if (user.coins < selectedTeller.cost) {
      toast({
        title: "Yetersiz altın!",
        description: `Bu falcı için ${selectedTeller.cost} altına ihtiyacın var.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Coin düş
      const deductResult = await updateCoins(user.id, selectedTeller.cost, 'spend');
      
      if (!deductResult.success) {
        throw new Error('Coin düşürme başarısız');
      }
      
      window.dispatchEvent(new Event('coinsUpdated'));

      // Fotoğrafları base64'e çevir
      const person1FincanBase64 = await convertImageToBase64(person1.fincan.file!);
      const person1TabakBase64 = await convertImageToBase64(person1.tabak.file!);
      const person2FincanBase64 = await convertImageToBase64(person2.fincan.file!);
      const person2TabakBase64 = await convertImageToBase64(person2.tabak.file!);

      // API call
      const response = await fetch('https://asil58.app.n8n.cloud/webhook/cift-fali', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          fortune_teller_id: Number(tellerId),
          couple_info: {
            person1: {
              name: person1.name,
              birth_date: person1.birthDate,
              zodiac_sign: person1.zodiacSign
            },
            person2: {
              name: person2.name,
              birth_date: person2.birthDate,
              zodiac_sign: person2.zodiacSign
            },
            relationship_duration: relationshipDuration,
            relationship_type: relationshipType
          },
          focus_area: focusArea,
          images: {
            person1_fincan: person1FincanBase64,
            person1_tabak: person1TabakBase64,
            person2_fincan: person2FincanBase64,
            person2_tabak: person2TabakBase64
          }
        })
      });

      if (!response.ok) {
        throw new Error('Fal analizi başarısız oldu');
      }

      const data = await response.json();
      const fortuneText = data.fortune || data.message || 'Falınız hazırlandı!';

      // Falı kaydet
      const { error: fortuneError } = await supabase
        .from('fortunes')
        .insert({
          user_id: user.id,
          fortune_text: fortuneText,
          fortune_teller_id: Number(tellerId),
          fortune_teller_name: selectedTeller.name,
          fortune_teller_emoji: selectedTeller.emoji,
          fortune_teller_cost: selectedTeller.cost,
          images: {
            person1_fincan: person1FincanBase64,
            person1_tabak: person1TabakBase64,
            person2_fincan: person2FincanBase64,
            person2_tabak: person2TabakBase64,
            couple_info: {
              person1: { name: person1.name, zodiac: person1.zodiacSign },
              person2: { name: person2.name, zodiac: person2.zodiacSign },
              focus_area: focusArea
            }
          }
        });

      if (fortuneError) {
        console.error('Fortune kaydetme hatası:', fortuneError);
      }

      // Bildirim oluştur
      await createNotification(
        user.id,
        'Çift Falın Hazır! 💕',
        `${selectedTeller.name} tarafından hazırlanan çift falın seni bekliyor!`
      );

      setFortune(fortuneText);
      setStep(6);

      toast({
        title: "Falın hazır! 💕",
        description: "Çift falın başarıyla oluşturuldu!"
      });

    } catch (error) {
      console.error('Fal hatası:', error);
      
      // Coin iade et
      try {
        await updateCoins(user.id, selectedTeller.cost, 'earn');
        window.dispatchEvent(new Event('coinsUpdated'));
      } catch (refundError) {
        console.error('Refund error:', refundError);
      }

      toast({
        title: "Bir hata oluştu!",
        description: "Falın bakılırken bir sorun oluştu. Lütfen tekrar dene.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const PhotoUploadCard = ({ 
    person, 
    type, 
    data, 
    label 
  }: { 
    person: 'person1' | 'person2'; 
    type: 'fincan' | 'tabak'; 
    data: PhotoData; 
    label: string;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="relative">
        <Label className="text-white mb-2 block">{label}</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(person, type, e.target.files?.[0] || null)}
        />
        
        {data.preview ? (
          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-pink-500/30">
            <img src={data.preview} alt={label} className="w-full h-full object-cover" />
            <button
              onClick={() => {
                if (person === 'person1') {
                  setPerson1(prev => ({ ...prev, [type]: { file: null, preview: '' } }));
                } else {
                  setPerson2(prev => ({ ...prev, [type]: { file: null, preview: '' } }));
                }
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square border-2 border-dashed border-pink-500/50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-pink-500/10 transition-colors"
          >
            <Upload size={32} className="text-pink-300" />
            <span className="text-sm text-white/70">Fotoğraf Yükle</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/fortune/ask')}
            className="flex items-center gap-2 text-white mb-6 hover:text-pink-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Geri
          </motion.button>

          {/* Falcı Bilgisi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">{selectedTeller?.emoji}</div>
            <h1 className="text-2xl font-bold text-white mb-2">{selectedTeller?.name}</h1>
            <p className="text-white/70">Adım {step} / 5</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Adım 1: Odak Alanı */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card-mystical p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  <Heart className="inline mr-2" />
                  Odak Alanı Seçin
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {focusAreas.map((area) => (
                    <button
                      key={area.value}
                      onClick={() => setFocusArea(area.value)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        focusArea === area.value
                          ? 'border-pink-500 bg-pink-500/20'
                          : 'border-white/20 hover:border-pink-500/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{area.emoji}</div>
                      <div className="text-white font-medium">{area.label}</div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500"
                  size="lg"
                >
                  İleri <ChevronRight className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Adım 2: 1. Kişi Bilgileri */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card-mystical p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  1. Kişi Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">İsim</Label>
                    <Input
                      value={person1.name}
                      onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Doğum Tarihi</Label>
                    <Input
                      type="date"
                      value={person1.birthDate}
                      onChange={(e) => setPerson1({ ...person1, birthDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Burç</Label>
                    <Select value={person1.zodiacSign} onValueChange={(v) => setPerson1({ ...person1, zodiacSign: v })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Burç seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {zodiacSigns.map((sign) => (
                          <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PhotoUploadCard person="person1" type="fincan" data={person1.fincan} label="Fincan Fotoğrafı" />
                    <PhotoUploadCard person="person1" type="tabak" data={person1.tabak} label="Tabak Fotoğrafı" />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    Geri
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                  >
                    İleri <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Adım 3: 2. Kişi Bilgileri */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card-mystical p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  2. Kişi Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">İsim</Label>
                    <Input
                      value={person2.name}
                      onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Doğum Tarihi</Label>
                    <Input
                      type="date"
                      value={person2.birthDate}
                      onChange={(e) => setPerson2({ ...person2, birthDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Burç</Label>
                    <Select value={person2.zodiacSign} onValueChange={(v) => setPerson2({ ...person2, zodiacSign: v })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Burç seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {zodiacSigns.map((sign) => (
                          <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <PhotoUploadCard person="person2" type="fincan" data={person2.fincan} label="Fincan Fotoğrafı" />
                    <PhotoUploadCard person="person2" type="tabak" data={person2.tabak} label="Tabak Fotoğrafı" />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                    Geri
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!canProceedStep3}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                  >
                    İleri <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Adım 4: İlişki Bilgileri */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card-mystical p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  İlişki Bilgileri
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">İlişki Süresi</Label>
                    <Input
                      value={relationshipDuration}
                      onChange={(e) => setRelationshipDuration(e.target.value)}
                      placeholder="Örn: 2 yıl"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">İlişki Türü</Label>
                    <Select value={relationshipType} onValueChange={setRelationshipType}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="İlişki türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                    Geri
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={!canProceedStep4}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                  >
                    İleri <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Adım 5: Onay */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card-mystical p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  <Sparkles className="inline mr-2" />
                  Falınıza Hazır mısınız?
                </h2>
                <div className="bg-white/10 rounded-xl p-6 space-y-4 mb-6">
                  <div className="flex justify-between text-white">
                    <span>Odak Alanı:</span>
                    <span className="font-bold">
                      {focusAreas.find(a => a.value === focusArea)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>1. Kişi:</span>
                    <span className="font-bold">{person1.name} ({person1.zodiacSign})</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>2. Kişi:</span>
                    <span className="font-bold">{person2.name} ({person2.zodiacSign})</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>İlişki:</span>
                    <span className="font-bold">
                      {relationshipTypes.find(t => t.value === relationshipType)?.label} - {relationshipDuration}
                    </span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Falcı:</span>
                    <span className="font-bold">{selectedTeller?.name}</span>
                  </div>
                  <div className="flex justify-between text-pink-400 font-bold text-lg">
                    <span>Ücret:</span>
                    <span>{selectedTeller?.cost} altın</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setStep(4)} variant="outline" className="flex-1">
                    Geri
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                    size="lg"
                  >
                    {loading ? 'Falınız Bakılıyor...' : 'Falıma Bak 💕'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-mystical p-12 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-6"
                >
                  💕
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Falınız Bakılıyor...
                </h2>
                <p className="text-white/70">
                  {selectedTeller?.name} çiftinizin kahve fallarını analiz ediyor
                </p>
              </motion.div>
            )}

            {/* Sonuç */}
            {step === 6 && fortune && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-mystical p-8"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedTeller?.emoji}</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Çift Falınız Hazır! 💕
                  </h2>
                  <p className="text-white/70">
                    {person1.name} & {person2.name}
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {person1.fincan.preview && (
                      <img src={person1.fincan.preview} alt="P1 Fincan" className="rounded-lg aspect-square object-cover" />
                    )}
                    {person1.tabak.preview && (
                      <img src={person1.tabak.preview} alt="P1 Tabak" className="rounded-lg aspect-square object-cover" />
                    )}
                    {person2.fincan.preview && (
                      <img src={person2.fincan.preview} alt="P2 Fincan" className="rounded-lg aspect-square object-cover" />
                    )}
                    {person2.tabak.preview && (
                      <img src={person2.tabak.preview} alt="P2 Tabak" className="rounded-lg aspect-square object-cover" />
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white whitespace-pre-wrap">{fortune}</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/fortune')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
                  size="lg"
                >
                  Fal Türlerine Dön
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CiftFaliForm;
