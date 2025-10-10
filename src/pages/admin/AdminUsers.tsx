import { useState, useEffect } from 'react';
import { Search, Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { exportUsersToCSV } from '@/lib/admin';
import { deleteUser as deleteUserFromAuth } from '@/lib/auth';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();
  const perPage = 20;

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

  const totalUsers = filteredUsers.length;
  const totalPages = totalPagesState;

  return (
    <AdminLayout>
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

        {/* Search */}
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
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

          {/* Pagination */}
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
      </div>

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
    </AdminLayout>
  );
};

export default AdminUsers;
