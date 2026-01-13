'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/types';
import { formatTurkeyDateReadable } from '@/lib/date-utils';
import { calculateTableStatistics } from '@/lib/calculations';
import { formatCurrency, formatNumber } from '@/lib/format';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfitChart } from '@/components/profit-chart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ShareTablePage() {
  const params = useParams();
  const tableId = params.id as string;

  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTable = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}`);
      const data = await response.json();
      setTable(data);
    } catch (error) {
      console.error('Error fetching table:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableId) {
      fetchTable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center">Yükleniyor...</div>
      </main>
    );
  }

  if (!table) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center">Tablo bulunamadı.</div>
      </main>
    );
  }

  const statistics = calculateTableStatistics(
    table.data.items,
    table.is_premium,
    table.order_type
  );

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mt-4">
              {table.table_name || table.created_by || 'İsimsiz Tablo'}
            </h1>
            {table.table_name && (
              <p className="text-muted-foreground mt-1">
                {table.created_by}
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              Oluşturulma: {formatTurkeyDateReadable(table.created_at)} | 
              Versiyon: v{table.version_number}
            </p>
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
              ⚠️ Bu görünüm salt okunurdur. Düzenleme yapılamaz.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="statistics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Item Detay</TabsTrigger>
            <TabsTrigger value="statistics">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Item Detay Bilgileri</CardTitle>
                <CardDescription>
                  Item bilgilerini görüntüleyin (Salt Okunur)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {table.data.items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Henüz item eklenmemiş.
                  </p>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {table.data.items.map((item) => (
                      <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4 mb-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="text-left">
                              <h3 className="font-semibold text-lg">{item.name || 'İsimsiz Item'}</h3>
                              <p className="text-sm text-muted-foreground">
                                Tier: {item.tier} | Quality: {item.quality}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            <div>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Tier: {item.tier} | Quality: {item.quality}
                              </p>
                            </div>

                            {/* Caerleon Black Market */}
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-2">Caerleon Black Market</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Alış Fiyatı</p>
                                  <p className="text-sm py-2">
                                    {item.caerleonBlackMarket.buyPrice ? formatNumber(item.caerleonBlackMarket.buyPrice) : '0'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Alış Adedi</p>
                                  <p className="text-sm py-2">
                                    {item.caerleonBlackMarket.buyQuantity ? formatNumber(item.caerleonBlackMarket.buyQuantity) : '0'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Satış Adedi</p>
                                  <p className="text-sm py-2">
                                    {item.caerleonBlackMarket.sellQuantity ? formatNumber(item.caerleonBlackMarket.sellQuantity) : '0'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-8">
            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Net Kar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${statistics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(statistics.netProfit)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Toplam Zarar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(statistics.totalLoss)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ortalama Kar/Zarar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${statistics.itemCalculations.length > 0 ? (statistics.itemCalculations.reduce((sum, calc) => sum + calc.profit, 0) / statistics.itemCalculations.length >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                    {statistics.itemCalculations.length > 0 
                      ? formatCurrency(statistics.itemCalculations.reduce((sum, calc) => sum + calc.profit, 0) / statistics.itemCalculations.length)
                      : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.itemCalculations.length} ürün için ortalama
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Kar/Zarar Görselleştirme */}
            <Card>
              <CardHeader>
                <CardTitle>Item Bazlı Kar/Zarar Görselleştirme</CardTitle>
                <CardDescription>
                  Her item için kar/zarar grafik görünümü
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics.itemCalculations.length > 0 ? (
                  <ProfitChart calculations={statistics.itemCalculations} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Görselleştirme için item ekleyin.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
