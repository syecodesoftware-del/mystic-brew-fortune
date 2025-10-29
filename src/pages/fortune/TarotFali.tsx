import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';

interface TarotTeller {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
  gradient: string;
  features: string[];
}

const TarotFali = () => {
  const navigate = useNavigate();

  const tarotTellers: TarotTeller[] = [
    {
      id: 1,
      name: 'Temel Tarot Okuyucu',
      description: 'Hızlı ve net yorumlar',
      price: 35,
      emoji: '🔮',
      gradient: 'from-purple-400 to-purple-600',
      features: ['Temel yorum', 'Hızlı sonuç', '3 kart açılımı']
    },
    {
      id: 2,
      name: 'Aşk Tarot Uzmanı',
      description: 'İlişki ve aşk odaklı',
      price: 45,
      emoji: '💖',
      gradient: 'from-pink-400 to-rose-600',
      features: ['Aşk yorumu', 'İlişki analizi', 'Duygusal rehberlik']
    },
    {
      id: 3,
      name: 'Kariyer Tarot Danışmanı',
      description: 'İş ve kariyer rehberliği',
      price: 55,
      emoji: '💼',
      gradient: 'from-blue-400 to-indigo-600',
      features: ['Kariyer tavsiyesi', 'İş fırsatları', 'Başarı yolları']
    },
    {
      id: 4,
      name: 'Ruhsal Tarot Rehberi',
      description: 'Derin ruhsal içgörüler',
      price: 70,
      emoji: '🌟',
      gradient: 'from-violet-400 to-purple-700',
      features: ['Ruhsal analiz', 'İçsel yolculuk', 'Enerji okuma']
    },
    {
      id: 5,
      name: 'Master Tarot Okuyucu',
      description: 'En kapsamlı ve detaylı yorum',
      price: 90,
      emoji: '✨',
      gradient: 'from-indigo-500 to-purple-800',
      features: ['Tam analiz', 'Detaylı yorum', 'Özel rehberlik', 'Gelecek projeksiyonu']
    }
  ];

  const handleTellerSelect = (tellerId: number) => {
    navigate(`/fortune/tarot/select/${tellerId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/fortune')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 mb-6 shadow-2xl shadow-purple-500/50">
            <span className="text-4xl">🎴</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tarot Falı 🌙
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Antik bilgeliğin rehberliğinde geleceğini keşfet. 78 kart arasından seçeceğin 3 kart, geçmişini, şimdini ve geleceğini aydınlatacak.
          </p>
        </motion.div>

        {/* Tellers Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white text-center mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Tarot Okuyucusunu Seç
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tarotTellers.map((teller, index) => (
              <motion.div
                key={teller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTellerSelect(teller.id)}
                className="group cursor-pointer"
              >
                <div className="relative card-mystical p-6 hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)] hover:-translate-y-2">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${teller.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                  {/* Icon */}
                  <div className={`relative w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${teller.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{teller.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {teller.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-3">
                      {teller.description}
                    </p>

                    {/* Price */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                      <span className="text-lg">{teller.price}</span>
                      <span className="text-sm">coin</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    {teller.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Sparkle effect */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-mystical p-6"
          >
            <div className="text-3xl mb-3">🌙</div>
            <h3 className="text-lg font-semibold text-white mb-2">78 Kart</h3>
            <p className="text-sm text-white/70">
              Tam tarot destesi ile geçmiş, şimdi ve gelecek
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card-mystical p-6"
          >
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="text-lg font-semibold text-white mb-2">Kişisel Yorum</h3>
            <p className="text-sm text-white/70">
              Senin için özel hazırlanmış detaylı analiz
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card-mystical p-6"
          >
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-white mb-2">Hızlı Sonuç</h3>
            <p className="text-sm text-white/70">
              Birkaç dakika içinde falın hazır
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TarotFali;
