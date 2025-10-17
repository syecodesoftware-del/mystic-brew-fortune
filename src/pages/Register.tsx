import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Clock, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { registerUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  birthTime: string;
  city: string;
  gender: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
  gender?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    birthTime: '',
    city: '',
    gender: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Ad gerekli';
        if (value.trim().length < 2) return 'Ad en az 2 karakter olmalı';
        break;
      case 'lastName':
        if (!value.trim()) return 'Soyad gerekli';
        if (value.trim().length < 2) return 'Soyad en az 2 karakter olmalı';
        break;
      case 'email':
        if (!value.trim()) return 'E-posta gerekli';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta girin';
        break;
      case 'password':
        if (!value) return 'Şifre gerekli';
        if (value.length < 6) return 'Şifre en az 6 karakter olmalı';
        break;
      case 'confirmPassword':
        if (!value) return 'Şifre tekrarı gerekli';
        if (value !== formData.password) return 'Şifreler eşleşmiyor';
        break;
      case 'birthDate':
        if (!value) return 'Doğum tarihi gerekli';
        const selectedDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();
        const isBeforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate());
        const actualAge = isBeforeBirthday ? age - 1 : age;
        
        if (selectedDate >= today) return 'Geçerli bir tarih girin';
        if (actualAge < 13) return '13 yaşından küçükler kaydolamaz';
        break;
      case 'birthTime':
        if (!value) return 'Doğum saati gerekli';
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return 'Geçerli bir saat girin (SS:DD)';
        break;
      case 'city':
        if (!value.trim()) return 'Şehir gerekli';
        if (value.trim().length < 2) return 'Şehir adı en az 2 karakter olmalı';
        break;
      case 'gender':
        if (!value) return 'Cinsiyet seçimi gerekli';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSelectChange = (name: 'city' | 'gender', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doğru şekilde doldurun",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        city: formData.city.trim(),
        gender: formData.gender
      });

      if (result.success && result.user) {
        toast({
          title: "🎉 Kayıt başarılı!",
          description: `${result.user.first_name}, 50 altın kazandın! 💰`,
        });

        // Coin event trigger
        window.dispatchEvent(new Event('coinsUpdated'));

        setTimeout(() => {
          navigate('/fortune');
        }, 1000);
      } else {
        toast({
          title: "Hata",
          description: result.error || "Kayıt başarısız",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass = "bg-card/50 border-2 text-foreground placeholder:text-muted-foreground transition-all";
    if (!touched[fieldName]) return baseClass;
    if (errors[fieldName]) return `${baseClass} border-destructive focus:border-destructive`;
    return `${baseClass} border-green-500 focus:border-green-500`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="Falcan Logo" className="w-16 h-16 mx-auto mb-4 animate-pulse-glow" />
          <h1 className="text-4xl font-bold text-[hsl(220,13%,18%)] mb-2 font-mystic">Üye Ol</h1>
          <p className="text-[hsl(220,9%,46%)]">Enerjini keşfet, falını öğren</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(167,139,250,0.12)] space-y-5">
          <div>
            <Label htmlFor="firstName" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Ad
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Adınız"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="given-name"
              className={getInputClassName('firstName') + ' select-text'}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Soyad
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Soyadınız"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="family-name"
              className={getInputClassName('lastName') + ' select-text'}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              E-posta
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="E-posta adresiniz"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              className={getInputClassName('email') + ' select-text'}
            />
            {touched.email && errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Şifre
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreniz (min 6 karakter)"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                className={getInputClassName('password') + ' select-text pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-destructive text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Şifre Tekrar
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                className={getInputClassName('confirmPassword') + ' select-text pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDate" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Doğum Tarihiniz
            </Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.birthDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName('birthDate') + ' select-text'}
            />
            {touched.birthDate && errors.birthDate && (
              <p className="text-destructive text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthTime" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              Doğum Saatiniz
            </Label>
            <Input
              id="birthTime"
              name="birthTime"
              type="time"
              placeholder="Örn: 14:30"
              value={formData.birthTime}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName('birthTime') + ' select-text'}
            />
            {touched.birthTime && errors.birthTime && (
              <p className="text-destructive text-sm mt-1">{errors.birthTime}</p>
            )}
          </div>

          <div>
            <Label htmlFor="city" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Şehir
            </Label>
            <Select value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}>
              <SelectTrigger className={`${getInputClassName('city')} bg-card/50`}>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50 max-h-[300px]">
                {TURKISH_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.city && errors.city && (
              <p className="text-destructive text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gender" className="text-[hsl(220,13%,18%)] flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Cinsiyet
            </Label>
            <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
              <SelectTrigger className={`${getInputClassName('gender')} bg-card/50`}>
                <SelectValue placeholder="Cinsiyet seçin" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="Kadın">Kadın</SelectItem>
                <SelectItem value="Erkek">Erkek</SelectItem>
                <SelectItem value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</SelectItem>
              </SelectContent>
            </Select>
            {touched.gender && errors.gender && (
              <p className="text-destructive text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl transition-all hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Kayıt yapılıyor...
              </span>
            ) : (
              'Üye Ol'
            )}
          </Button>

          <p className="text-center text-muted-foreground text-sm">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
