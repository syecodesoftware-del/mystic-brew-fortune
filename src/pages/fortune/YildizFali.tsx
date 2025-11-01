import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';

interface AstrologerTeller {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
  gradient: string;
  features: string[];
}

const YildizFali = () => {
  const navigate = useNavigate();

  const astrologers: AstrologerTeller[] = [
    {
      id: 1,
      name: 'Temel Burç Okuyucu',
      description: 'Güneş burcu analizi',
      price: 30,
      emoji: '⭐',
      gradient: 'from-yellow-400 to-amber-500',
      features: ['Temel burç yorumu', 'Hızlı analiz', 'Günlük öneriler']
    },
    {
      id: 2,
      name: 'Ay Burcu Uzmanı',
      description: 'Duygusal dünya analizi',
      price: 45,
      emoji: '🌙',
      gradient: 'from-indigo-400 to-purple-500',
      features: ['Ay burcu analizi', 'Duygusal yönlendirme', 'İç dünya keşfi']
    },
    {
      id: 3,
      name: 'Yükselen Analisti',
      description: 'Kişilik ve görünüm',
      price: 60,
      emoji: '⬆️',
      gradient: 'from-cyan-400 to-blue-600',
      features: ['Yükselen burç', 'Dış kişilik', 'İlk izlenim analizi']
    },
    {
      id: 4,
      name: 'Gezegen Uzmanı',
      description: 'Detaylı gezegen analizi',
      price: 75,
      emoji: '🪐',
      gradient: 'from-purple-400 to-pink-600',
      features: ['Gezegen konumları', 'Evler analizi', 'Açılar ve aspektler']
    },
    {
      id: 5,
      name: 'Master Astrolog',
      description: 'Tam doğum haritası',
      price: 95,
      emoji: '✨',
      gradient: 'from-violet-500 to-fuchsia-600',
      features: ['Kapsamlı analiz', 'Transit tahminleri', 'Gelecek öngörüleri', 'Özel danışmanlık']
    }
  ];

  const handleTellerSelect = (tellerId: number) => {
    navigate(`/fortune/yildiz/form/${tellerId}`);
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-2xl shadow-yellow-500/50">
            <span className="text-4xl">⭐</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Yıldız Falı ✨
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Doğum haritanın sırlarını keşfet. Yıldızlar senin için ne diyor? Güneş, ay ve yükselen burcun ile gezegenlerin konumları geleceğini aydınlatsın.
          </p>
        </motion.div>

        {/* Astrologers Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white text-center mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Astrologunu Seç
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {astrologers.map((astrologer, index) => (
              <motion.div
                key={astrologer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTellerSelect(astrologer.id)}
                className="group cursor-pointer"
              >
                <div className="relative card-mystical p-6 hover:shadow-[0_25px_50px_-12px_rgba(251,191,36,0.4)] hover:-translate-y-2">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${astrologer.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />

                  {/* Icon */}
                  <div className={`relative w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${astrologer.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{astrologer.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      {astrologer.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-3">
                      {astrologer.description}
                    </p>

                    {/* Price */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                      <span className="text-lg">{astrologer.price}</span>
                      <span className="text-sm">coin</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    {astrologer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
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
            <div className="text-3xl mb-3">♈♉♊</div>
            <h3 className="text-lg font-semibold text-white mb-2">12 Burç</h3>
            <p className="text-sm text-white/70">
              Güneş, ay ve yükselen burcunla tam analiz
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card-mystical p-6"
          >
            <div className="text-3xl mb-3">🌌</div>
            <h3 className="text-lg font-semibold text-white mb-2">Doğum Haritası</h3>
            <p className="text-sm text-white/70">
              Senin için özel hazırlanmış kozmik harita
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card-mystical p-6"
          >
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="text-lg font-semibold text-white mb-2">Kişisel Yorum</h3>
            <p className="text-sm text-white/70">
              Detaylı ve kişiye özel astroloji yorumu
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default YildizFali;
