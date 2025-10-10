import { useState, useEffect } from 'react';
import { Search, Download, Eye, Trash2, ChevronLeft, ChevronRight, Edit, MapPin, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { exportUsersToCSV } from '@/lib/admin';
import { deleteUser as deleteUserFromAuth, adminUpdateUser, adminGiveCoins } from '@/lib/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

const editUserSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  birthDate: z.string().min(1, 'Doğum tarihi gerekli'),
  birthTime: z.string().min(1, 'Doğum saati gerekli'),
  city: z.string().min(2, 'Şehir adı en az 2 karakter olmalı'),
  gender: z.string().min(1, 'Cinsiyet seçimi gerekli'),
  password: z.string().optional(),
});

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGiveCoinsModal, setShowGiveCoinsModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const { toast } = useToast();
  const perPage = 20;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(editUserSchema),
  });

  const loadUsers = () => {
    console.log('Loading users...');
    let allUsers = JSON.parse(localStorage.getItem('coffee_users') || '[]');
    console.log('All users from localStorage:', allUsers);

    // Defensive sync: include current user if missing
    try {
      const current = JSON.parse(localStorage.getItem('coffee_current_user') || 'null');
      if (current && !allUsers.some((u: any) => u.id === current.id || u.email === current.email)) {
        allUsers.push(current);
        localStorage.setItem('coffee_users', JSON.stringify(allUsers));
        console.log('Synced current user into coffee_users');
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    }
    
    setFilteredUsers(allUsers);
    
    let displayUsers = allUsers;
    if (searchTerm) {
      displayUsers = allUsers.filter((u: any) =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setTotalPagesState(Math.ceil(displayUsers.length / perPage));
    
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setUsers(displayUsers.slice(start, end));
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, page]);

  const handleDeleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        deleteUserFromAuth(userId);
        loadUsers();
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı silindi',
        });
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Kullanıcı silinemedi',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      city: user.city || '',
      gender: user.gender || '',
      password: '',
    });
    setShowEditModal(true);
  };

  const onSubmitEdit = (data: any) => {
    try {
      const updateData = {
        ...data,
        ...(data.password && data.password.trim() !== '' ? { password: data.password } : {}),
      };
      
      // Eğer şifre boşsa, şifre alanını siliyoruz
      if (!data.password || data.password.trim() === '') {
        delete updateData.password;
      }

      adminUpdateUser(selectedUser.id, updateData);
      loadUsers();
      setShowEditModal(false);
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı bilgileri güncellendi',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı güncellenemedi',
        variant: 'destructive',
      });
    }
  };
  
  const handleGiveCoins = (user: any) => {
    setSelectedUser(user);
    setCoinAmount('');
    setShowGiveCoinsModal(true);
  };
  
  const submitGiveCoins = () => {
    try {
      const amount = parseInt(coinAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Geçerli bir miktar girin');
      }
      
      adminGiveCoins(selectedUser.id, amount);
      loadUsers();
      setShowGiveCoinsModal(false);
      toast({
        title: 'Başarılı',
        description: `${amount} altın başarıyla verildi!`,
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Altın verilemedi',
        variant: 'destructive',
      });
    }
  };

  const totalUsers = filteredUsers.length;
  const totalPages = totalPagesState;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-600">Toplam {totalUsers} kullanıcı</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="outline">
            Yenile
          </Button>
          <Button onClick={exportUsersToCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Excel İndir
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Altın</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fal #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                      <Coins className="w-4 h-4" />
                      {user.coins || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.fortunes?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-yellow-600 hover:text-yellow-700"
                        onClick={() => handleGiveCoins(user)}
                      >
                        <Coins className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Sayfa {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doğum Tarihi</p>
                  <p className="font-medium">{selectedUser.birthDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doğum Saati</p>
                  <p className="font-medium">{selectedUser.birthTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Şehir</p>
                  <p className="font-medium">{selectedUser.city || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cinsiyet</p>
                  <p className="font-medium">{selectedUser.gender || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Fal</p>
                  <p className="font-medium">{selectedUser.fortunes?.length || 0}</p>
                </div>
              </div>

              {selectedUser.fortunes && selectedUser.fortunes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Fal Geçmişi</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedUser.fortunes.map((fortune: any) => (
                      <div key={fortune.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {new Date(fortune.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{fortune.fortune}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Ad"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Soyad"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="E-posta"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register('birthDate')}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.birthDate.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birthTime">Doğum Saati</Label>
                  <Input
                    id="birthTime"
                    type="time"
                    {...register('birthTime')}
                  />
                  {errors.birthTime && (
                    <p className="text-sm text-red-500 mt-1">{errors.birthTime.message as string}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50 max-h-[300px]">
                          {TURKISH_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">Cinsiyet</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          <SelectItem value="Kadın">Kadın</SelectItem>
                          <SelectItem value="Erkek">Erkek</SelectItem>
                          <SelectItem value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Yeni Şifre (Boş bırakın değiştirmek istemiyorsanız)</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Yeni şifre"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  İptal
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Kaydet
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Give Coins Modal */}
      <Dialog open={showGiveCoinsModal} onOpenChange={setShowGiveCoinsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-600" />
              💰 Altın Ver
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span> adlı kullanıcıya altın vermek üzeresiniz.
                </p>
                <p className="text-sm text-gray-600">
                  Mevcut bakiye: <span className="font-semibold text-yellow-600">{selectedUser.coins || 0} 💰</span>
                </p>
              </div>
              
              <div>
                <Label htmlFor="coinAmount">Verilecek Miktar</Label>
                <Input
                  id="coinAmount"
                  type="number"
                  min="1"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="Örn: 100"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGiveCoinsModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={submitGiveCoins}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Coins className="w-4 h-4 mr-2" />
              Altın Ver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
