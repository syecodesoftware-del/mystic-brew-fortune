import { useState } from 'react';
import { Lock, Download, Upload, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { updateAdminPassword, exportAllData } from '@/lib/admin';
import { useAdmin } from '@/hooks/useAdmin';

const AdminSettings = () => {
  const { admin } = useAdmin();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateAdminPassword(currentPassword, newPassword);
      toast({
        title: 'Başarılı',
        description: 'Şifreniz güncellendi',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleResetDatabase = () => {
    if (confirm('TÜM VERİLER SİLİNECEK! Emin misiniz?')) {
      if (confirm('SON UYARI: Bu işlem geri alınamaz! Devam edilsin mi?')) {
        localStorage.removeItem('coffee_users');
        toast({
          title: 'Başarılı',
          description: 'Veritabanı sıfırlandı',
        });
        window.location.reload();
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-gray-600">Sistem ayarları ve yapılandırma</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Admin Hesabı</TabsTrigger>
            <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
            <TabsTrigger value="danger">Tehlikeli Bölge</TabsTrigger>
          </TabsList>

          {/* Admin Account */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h3>
                <p className="text-sm text-gray-500">Güvenliğiniz için düzenli olarak şifrenizi değiştirin</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="current">Mevcut Şifre</Label>
                  <Input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="new">Yeni Şifre</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm">Yeni Şifre Tekrar</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Lock className="w-4 h-4 mr-2" />
                  Şifreyi Güncelle
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hesap Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">E-posta</p>
                  <p className="font-medium">{admin?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ad Soyad</p>
                  <p className="font-medium">{admin?.firstName} {admin?.lastName}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Veritabanı Yedekleme</h3>
                <p className="text-sm text-gray-500">Tüm verileri JSON formatında indirin</p>
              </div>

              <Button onClick={exportAllData} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Tüm Verileri İndir
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Veri İçe Aktarma</h3>
                <p className="text-sm text-gray-500">Yedek dosyasından verileri geri yükleyin</p>
              </div>

              <div className="flex items-center gap-4">
                <Input type="file" accept=".json" className="flex-1" />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Yükle
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger" className="space-y-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Tehlikeli Bölge</h3>
                  <p className="text-sm text-red-700 mb-6">
                    Bu işlemler geri alınamaz! Lütfen dikkatli olun.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Veritabanını Sıfırla</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Tüm kullanıcılar ve fallar silinecek. Bu işlem geri alınamaz!
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleResetDatabase}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Veritabanını Sıfırla
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
