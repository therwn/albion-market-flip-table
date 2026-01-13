'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/types';
import { formatTurkeyDateReadable } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format';
import { Plus, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface Statistics {
  mostSoldItems: Array<{ itemName: string; quantity: number }>;
  mostProfitableItems: Array<{ itemName: string; profit: number }>;
  leastProfitableItems: Array<{ itemName: string; profit: number }>;
}

export default function Home() {
  const [tables, setTables] = useState<Table[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    fetchStatistics();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm('Bu tabloyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Tablo silinemedi');
      }

      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Tablo silinirken bir hata oluştu.');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Albion Online Market Flip Table</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tablo Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* İstatistikler */}
        {!statsLoading && statistics && (
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-bold">Genel İstatistikler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">En Çok Satılan Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statistics.mostSoldItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{item.itemName || 'İsimsiz'}</span>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                      </div>
                    ))}
                    {statistics.mostSoldItems.length === 0 && (
                      <p className="text-sm text-muted-foreground">Henüz veri yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">En Çok Kar Ettiren Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statistics.mostProfitableItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{item.itemName || 'İsimsiz'}</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    ))}
                    {statistics.mostProfitableItems.length === 0 && (
                      <p className="text-sm text-muted-foreground">Henüz veri yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">En Düşük Karlı Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statistics.leastProfitableItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{item.itemName || 'İsimsiz'}</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    ))}
                    {statistics.leastProfitableItems.length === 0 && (
                      <p className="text-sm text-muted-foreground">Henüz veri yok</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Tablolar</h2>

        {loading ? (
          <div className="text-center py-12">
            <p>Yükleniyor...</p>
          </div>
        ) : tables.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Henüz tablo oluşturulmamış.</p>
              <Link href="/create">
                <Button>İlk Tabloyu Oluştur</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{table.table_name || table.created_by || 'İsimsiz Tablo'}</CardTitle>
                  <CardDescription>
                    {table.table_name && table.created_by && `${table.created_by} • `}
                    {formatTurkeyDateReadable(table.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium:</span>
                      <span>{table.is_premium ? 'Evet' : 'Hayır'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sipariş Tipi:</span>
                      <span>{table.order_type === 'buy_order' ? 'Alış Emri' : 'Satış Emri'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versiyon:</span>
                      <span>v{table.version_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item Sayısı:</span>
                      <span>{table.data?.items?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/table/${table.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Detay
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/table/${table.id}?edit=true`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
