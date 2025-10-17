import { useState, useEffect } from 'react';
import { Search, Eye, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAllFortunes } from '@/lib/admin';
import { deleteFortune, downloadFortune } from '@/lib/auth';

const AdminFortunes = () => {
  const [fortunes, setFortunes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFortune, setSelectedFortune] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFortunes();
  }, [page, searchTerm]);

  const loadFortunes = () => {
    const result = getAllFortunes(page, 20, searchTerm);
    setFortunes(result.fortunes);
    setTotalPages(result.totalPages);
  };

  const handleDelete = async (userId: string, fortuneId: string) => {
    if (confirm('Bu falı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteFortune(fortuneId);
        loadFortunes();
        toast({
          title: 'Başarılı',
          description: 'Fal silindi',
        });
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Fal silinemedi',
          variant: 'destructive',
        });
      }
    }
  };

  const handleView = (fortune: any) => {
    setSelectedFortune(fortune);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fallar</h1>
        <p className="text-gray-600">Tüm fal kayıtları</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Önizleme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fortunes.map((fortune, index) => (
                <tr key={fortune.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{fortune.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{fortune.userName}</div>
                      <div className="text-xs text-gray-500">{fortune.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fortune.timestamp).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <div className="line-clamp-2">{fortune.fortune}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(fortune)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadFortune(fortune)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(fortune.userId, fortune.id)}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fal Detayları</DialogTitle>
          </DialogHeader>
          {selectedFortune && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kullanıcı</p>
                  <p className="font-medium">{selectedFortune.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">
                    {new Date(selectedFortune.timestamp).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fal ID</p>
                  <p className="font-medium">#{selectedFortune.id}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Fal Yorumu</h4>
                <div className="p-4 bg-purple-50 rounded-lg whitespace-pre-wrap">
                  {selectedFortune.fortune}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => downloadFortune(selectedFortune)}>
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedFortune.userId, selectedFortune.id);
                    setShowDetailModal(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFortunes;
