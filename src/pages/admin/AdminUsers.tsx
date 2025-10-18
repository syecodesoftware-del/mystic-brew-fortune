import { useState, useEffect } from 'react';
import { Search, Download, Eye, Trash2, ChevronLeft, ChevronRight, Edit, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';
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
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  birth_date: z.string().min(1, 'Doğum tarihi gerekli'),
  birth_time: z.string().min(1, 'Doğum saati gerekli'),
  city: z.string().min(2, 'Şehir adı en az 2 karakter olmalı'),
  gender: z.string().min(1, 'Cinsiyet seçimi gerekli'),
});

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGiveCoinsModal, setShowGiveCoinsModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const { toast } = useToast();
  const perPage = 20;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(editUserSchema),
  });

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      console.log('Fetching users from Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('Users data:', data);
      console.log('Users error:', error);
      
      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: 'Hata',
          description: `Kullanıcılar yüklenemedi: ${error.message}`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No users found');
        toast({
          title: 'Bilgi',
          description: 'Henüz kullanıcı yok',
        });
      } else {
        console.log(`${data.length} users found`);
      }
      
      setUsers(data || []);
      setFilteredUsers(data || []);
      
    } catch (error: any) {
      console.error('Exception:', error);
      toast({
        title: 'Hata',
        description: 'Kullanıcılar yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((u) =>
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setPage(1);
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı silindi',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Hata',
        description: 'Kullanıcı silinemedi',
        variant: 'destructive',
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      birth_date: user.birth_date,
      birth_time: user.birth_time,
      city: user.city || '',
      gender: user.gender || '',
    });
    setShowEditModal(true);
  };

  const onSubmitEdit = async (data: any) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          birth_date: data.birth_date,
          birth_time: data.birth_time,
          city: data.city,
          gender: data.gender,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      await fetchUsers();
      setShowEditModal(false);
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı bilgileri güncellendi',
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı güncellenemedi',
        variant: 'destructive',
      });
    }
  };
  
  const handleGiveCoins = (user: User) => {
    setSelectedUser(user);
    setCoinAmount('');
    setShowGiveCoinsModal(true);
  };
  
  const submitGiveCoins = async () => {
    if (!selectedUser) return;

    try {
      const amount = parseInt(coinAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Geçerli bir miktar girin');
      }
      
      const { error } = await supabase
        .from('users')
        .update({
          coins: selectedUser.coins + amount,
          total_coins_earned: selectedUser.total_coins_earned + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      await fetchUsers();
      setShowGiveCoinsModal(false);
      toast({
        title: 'Başarılı',
        description: `${amount} altın başarıyla verildi!`,
      });
    } catch (error: any) {
      console.error('Give coins error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Altın verilemedi',
        variant: 'destructive',
      });
    }
  };

  const exportUsersToCSV = () => {
    const headers = ['ID', 'Ad', 'Soyad', 'E-posta', 'Altın', 'Şehir', 'Cinsiyet', 'Doğum Tarihi', 'Kayıt Tarihi'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.coins,
      u.city || '',
      u.gender || '',
      u.birth_date,
      new Date(u.created_at).toLocaleDateString('tr-TR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const displayUsers = filteredUsers.slice(start, end);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-gray-600">Toplam {totalUsers} kullanıcı</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline">
            🔄 Yenile
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {displayUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kullanıcı yok'}
          </p>
        </div>
      ) : (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
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
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
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
      )}

      {/* User Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doğum Tarihi</p>
                  <p className="font-medium">{selectedUser.birth_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doğum Saati</p>
                  <p className="font-medium">{selectedUser.birth_time}</p>
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
                  <p className="text-sm text-gray-500">Altın</p>
                  <p className="font-medium">{selectedUser.coins} 💰</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Kazanılan</p>
                  <p className="font-medium">{selectedUser.total_coins_earned} 💰</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Toplam Harcanan</p>
                  <p className="font-medium">{selectedUser.total_coins_spent} 💰</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
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
                  <Label htmlFor="first_name">Ad</Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    placeholder="Ad"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.first_name.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Soyad</Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    placeholder="Soyad"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.last_name.message as string}</p>
                  )}
                </div>
                <div className="col-span-2">
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
                <div>
                  <Label htmlFor="birth_date">Doğum Tarihi</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register('birth_date')}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.birth_date.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birth_time">Doğum Saati</Label>
                  <Input
                    id="birth_time"
                    type="time"
                    {...register('birth_time')}
                  />
                  {errors.birth_time && (
                    <p className="text-sm text-red-500 mt-1">{errors.birth_time.message as string}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Erkek</SelectItem>
                          <SelectItem value="female">Kadın</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender.message as string}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Give Coins Modal */}
      <Dialog open={showGiveCoinsModal} onOpenChange={setShowGiveCoinsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Altın Ver</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</span> kullanıcısına altın ver
              </p>
              <div>
                <Label htmlFor="coinAmount">Altın Miktarı</Label>
                <Input
                  id="coinAmount"
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="Miktar girin"
                  min="1"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGiveCoinsModal(false)}>
                  İptal
                </Button>
                <Button onClick={submitGiveCoins}>
                  Ver
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
