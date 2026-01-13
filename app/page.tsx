'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/types';
import { formatTurkeyDateReadable } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/format';
import { Plus, ArrowRight, Edit, Trash2, TrendingUp, Package, BarChart3, Sparkles, Zap } from 'lucide-react';
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
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-chart-1/5 to-chart-2/5 dark:from-primary/10 dark:via-chart-1/10 dark:to-chart-2/10 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.2),transparent_50%)] -z-10" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="relative mb-8 pt-6 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-chart-1 shadow-lg animate-float">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gradient">
                    Albion Online
                    <br />
                    <span className="text-4xl md:text-5xl">Market Flip Table</span>
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                  Piyasa fiyatlarını takip edin, kar analizleri yapın ve ticaret stratejilerinizi optimize edin.
                </p>
              </div>
              <div className="flex items-center gap-3 animate-slide-in-right">
                <div className="h-11">
                  <ThemeToggle />
                </div>
                <Link href="/create">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-chart-1 hover:from-primary/90 hover:to-chart-1/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="mr-2 h-5 w-5" />
                    Yeni Tablo Oluştur
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          {!statsLoading && statistics && (
            <div className="mb-12 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Genel İstatistikler</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">En Çok Satılan Ürünler</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.mostSoldItems.slice(0, 5).map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                          <span className="text-sm font-medium">{item.itemName || 'İsimsiz'}</span>
                          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {statistics.mostSoldItems.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz veri yok</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-green-500/50 bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <CardTitle className="text-xl">En Çok Kar Ettiren Ürünler</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.mostProfitableItems.slice(0, 5).map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                        >
                          <span className="text-sm font-medium">{item.itemName || 'İsimsiz'}</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                            {formatCurrency(item.profit)}
                          </span>
                        </div>
                      ))}
                      {statistics.mostProfitableItems.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz veri yok</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-orange-500/50 bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                      </div>
                      <CardTitle className="text-xl">En Düşük Karlı Ürünler</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statistics.leastProfitableItems.slice(0, 5).map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-2 rounded-lg hover:bg-accent/50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                        >
                          <span className="text-sm font-medium">{item.itemName || 'İsimsiz'}</span>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
                            {formatCurrency(item.profit)}
                          </span>
                        </div>
                      ))}
                      {statistics.leastProfitableItems.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz veri yok</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tablolar Bölümü */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Tablolar</h2>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-pulse-slow">
                  <div className="p-4 rounded-full bg-primary/20 mb-4">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto" />
                  </div>
                  <p className="text-muted-foreground text-lg">Yükleniyor...</p>
                </div>
              </div>
            ) : tables.length === 0 ? (
              <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
                <CardContent className="py-16 text-center">
                  <div className="mb-6 inline-block p-6 rounded-full bg-primary/10 animate-pulse-slow">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Henüz tablo oluşturulmamış</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    İlk tablonuzu oluşturarak piyasa analizlerinize başlayın
                  </p>
                  <Link href="/create">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-chart-1 hover:from-primary/90 hover:to-chart-1/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="mr-2 h-5 w-5" />
                      İlk Tabloyu Oluştur
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table, index) => (
                  <Card 
                    key={table.id} 
                    className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 overflow-hidden relative animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {/* Gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-bold truncate mb-1">
                            {table.table_name || table.created_by || 'İsimsiz Tablo'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {table.table_name && table.created_by && (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {table.created_by}
                              </span>
                            )}
                            <span className="text-xs">
                              {formatTurkeyDateReadable(table.created_at)}
                            </span>
                          </CardDescription>
                        </div>
                        {table.is_premium && (
                          <div className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold shadow-md">
                            PREMIUM
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-accent/50 border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Sipariş Tipi</div>
                            <div className="text-sm font-semibold">
                              {table.order_type === 'buy_order' ? (
                                <span className="text-green-600 dark:text-green-400">Alış Emri</span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400">Satış Emri</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-accent/50 border border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Versiyon</div>
                            <div className="text-sm font-semibold">v{table.version_number}</div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Item Sayısı</span>
                            <span className="text-lg font-bold text-primary">
                              {table.data?.items?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-4">
                      <Link href={`/table/${table.id}`} className="flex-1">
                        <Button variant="outline" className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                          Detay
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/table/${table.id}?edit=true`}>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(table.id)}
                        className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
