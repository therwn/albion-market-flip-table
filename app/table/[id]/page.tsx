'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableVersion, Item, OrderType, CityName, ItemQuality } from '@/types';
import { TIERS, QUALITIES, CITIES } from '@/lib/constants';
import { formatTurkeyDateReadable } from '@/lib/date-utils';
import { calculateTableStatistics } from '@/lib/calculations';
import { formatNumberInput, parseFormattedNumber, formatCurrency, formatNumber } from '@/lib/format';
import { Plus, X, ChevronDown, ChevronUp, Save, History, ArrowLeft, Download, Share2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfitChart } from '@/components/profit-chart';
import { exportTableToCSV, downloadCSV } from '@/lib/export';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ItemsTable } from '@/components/items-table';

export default function TableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;

  const [table, setTable] = useState<Table | null>(null);
  const [versions, setVersions] = useState<TableVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Table['data'] | null>(null);

  useEffect(() => {
    if (tableId) {
      fetchTable();
      fetchVersions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const fetchTable = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}`);
      const data = await response.json();
      setTable(data);
      setEditedData(data.data);
    } catch (error) {
      console.error('Error fetching table:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/tables/${tableId}/versions`);
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const handleSave = async () => {
    if (!editedData) return;

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: editedData,
          is_premium: table?.is_premium,
          order_type: table?.order_type,
        }),
      });

      if (!response.ok) {
        throw new Error('Tablo güncellenemedi');
      }

      const updatedTable = await response.json();
      setTable(updatedTable);
      setEditedData(updatedTable.data);
      setIsEditing(false);
      fetchVersions();
    } catch (error) {
      console.error('Error updating table:', error);
      alert('Tablo güncellenirken bir hata oluştu.');
    }
  };

  const loadVersion = (version: TableVersion) => {
    setEditedData(version.data);
    setIsEditing(true);
  };

  const addItem = () => {
    if (!editedData) return;
    const newItem: Item = {
      id: uuidv4(),
      name: '',
      tier: '4.0',
      quality: 'Normal',
      cities: [],
      caerleonBlackMarket: {
        buyPrice: 0,
        buyQuantity: 0,
        sellQuantity: 0,
        isSellOrder: false,
      },
    };
    setEditedData({
      ...editedData,
      items: [...editedData.items, newItem],
    });
  };

  const updateItem = (itemId: string, updates: Partial<Item>) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      items: editedData.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      items: editedData.items.filter(item => item.id !== itemId),
    });
  };

  const duplicateItem = (itemId: string) => {
    if (!editedData) return;
    console.log('Duplicating item:', itemId);
    const item = editedData.items.find(i => i.id === itemId);
    if (!item) {
      console.log('Item not found');
      return;
    }

    const duplicatedItem: Item = {
      ...item,
      id: uuidv4(),
      name: `${item.name} (Kopya)`,
      cities: item.cities.map(city => ({ ...city })),
      caerleonBlackMarket: { ...item.caerleonBlackMarket },
    };

    const itemIndex = editedData.items.findIndex(i => i.id === itemId);
    const newItems = [...editedData.items];
    newItems.splice(itemIndex + 1, 0, duplicatedItem);

    console.log('Item duplicated, new items count:', newItems.length);
    setEditedData({
      ...editedData,
      items: newItems,
    });
  };

  const reorderItems = (startIndex: number, endIndex: number) => {
    if (!editedData) return;
    console.log('Reordering items:', { startIndex, endIndex });
    const newItems = Array.from(editedData.items);
    const [removed] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, removed);
    
    console.log('New order:', newItems.map(i => i.name));
    setEditedData({
      ...editedData,
      items: newItems,
    });
  };

  const addCityToItem = (itemId: string, cityName: CityName) => {
    if (!editedData) return;
    const item = editedData.items.find(i => i.id === itemId);
    if (!item) return;

    const cityExists = item.cities.some(c => c.name === cityName);
    if (cityExists) return;

    const newCity = {
      name: cityName,
      buyPrice: editedData.orderType === 'buy_order' ? 0 : undefined,
      buyQuantity: editedData.orderType === 'buy_order' ? 0 : undefined,
      sellPrice: editedData.orderType === 'sell_order' ? 0 : undefined,
      sellQuantity: editedData.orderType === 'sell_order' ? 0 : undefined,
    };

    updateItem(itemId, {
      cities: [...item.cities, newCity],
    });
  };

  const removeCityFromItem = (itemId: string, cityName: CityName) => {
    if (!editedData) return;
    const item = editedData.items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      cities: item.cities.filter(c => c.name !== cityName),
    });
  };

  const updateCityData = (
    itemId: string,
    cityName: CityName,
    field: 'buyPrice' | 'buyQuantity' | 'sellPrice' | 'sellQuantity',
    value: number
  ) => {
    if (!editedData) return;
    const item = editedData.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedCities = item.cities.map(city => {
      if (city.name === cityName) {
        return { ...city, [field]: value };
      }
      return city;
    });

    updateItem(itemId, { cities: updatedCities });
  };



  // Keyboard shortcuts - must be called before early returns
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrl: true,
      action: () => {
        if (!isEditing && table && editedData) {
          setIsEditing(true);
        }
      },
      description: 'Düzenleme modunu aç/kapat',
    },
    {
      key: 's',
      ctrl: true,
      action: () => {
        if (isEditing && table && editedData) {
          handleSave();
        }
      },
      description: 'Kaydet',
    },
    {
      key: 'Escape',
      action: () => {
        if (isEditing && table && editedData) {
          setEditedData(table.data);
          setIsEditing(false);
        }
      },
      description: 'Düzenlemeyi iptal et',
    },
  ]);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center">Yükleniyor...</div>
      </main>
    );
  }

  if (!table || !editedData) {
    return (
      <main className="min-h-screen p-8">
        <div className="text-center">Tablo bulunamadı.</div>
      </main>
    );
  }

  const statistics = calculateTableStatistics(
    editedData.items,
    table.is_premium,
    table.order_type,
    editedData.startBalance,
    editedData.endBalance
  );

  const displayData = isEditing ? editedData : table.data;

  // Export to CSV
  const handleExportCSV = () => {
    if (!table || !statistics) return;
    const csvContent = exportTableToCSV(table, statistics.itemCalculations);
    const filename = `${table.table_name || 'tablo'}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Share table
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/table/${tableId}/share`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Paylaşım linki kopyalandı!');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Paylaşım linki kopyalandı!');
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="w-full px-4 md:px-32 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
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
              Son Güncelleme: {formatTurkeyDateReadable(table.updated_at)} | 
              Versiyon: v{table.version_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleExportCSV}
              title="CSV olarak dışa aktar (Ctrl+E)"
            >
              <Download className="mr-2 h-4 w-4" />
              CSV Export
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              title="Paylaşım linkini kopyala"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Paylaş
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  Versiyon Geçmişi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Versiyon Geçmişi</DialogTitle>
                  <DialogDescription>
                    Önceki versiyonları görüntüleyin ve yükleyin
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card key={version.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Versiyon {version.version_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTurkeyDateReadable(version.created_at)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadVersion(version)}
                          >
                            Yükle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setEditedData(table.data);
                  setIsEditing(false);
                }}>
                  İptal
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Düzenle
              </Button>
            )}
          </div>
        </div>

        {/* Market Ayarları ve Bakiye Bilgileri */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Market Ayarları ve Bakiye</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="premium">Premium</Label>
                      <p className="text-sm text-muted-foreground">
                        Premium: %4 Tax, Premiumsuz: %8 Tax
                      </p>
                    </div>
                    <Switch
                      id="premium"
                      checked={table.is_premium}
                      onCheckedChange={(checked) => {
                        // Premium değişikliği için table'ı güncelle
                        // Bu sadece görüntüleme için, gerçek güncelleme handleSave'de yapılacak
                      }}
                      disabled
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderType">Buy Order / Sell Order</Label>
                      <p className="text-sm text-muted-foreground">
                        {table.order_type === 'buy_order' 
                          ? 'Buy Order: Sadece Setup Fee (%2.5)'
                          : 'Sell Order: Tax + Setup Fee (%2.5)'}
                      </p>
                    </div>
                    <Switch
                      id="orderType"
                      checked={table.order_type === 'buy_order'}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startBalance">Başlangıç Bakiyesi</Label>
                    <Input
                      id="startBalance"
                      value={editedData.startBalance ? formatNumberInput(editedData.startBalance.toString()) : ''}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        setEditedData({
                          ...editedData,
                          startBalance: value || undefined,
                        });
                      }}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Günün başlangıç bakiyesi
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endBalance">Bitiş Bakiyesi</Label>
                    <Input
                      id="endBalance"
                      value={editedData.endBalance ? formatNumberInput(editedData.endBalance.toString()) : ''}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        setEditedData({
                          ...editedData,
                          endBalance: value || undefined,
                        });
                      }}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Günün bitiş bakiyesi
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Item Detay</TabsTrigger>
            <TabsTrigger value="statistics">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-8">
            {/* Item Listesi */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Item Detay Bilgileri</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Itemleri düzenleyin' : 'Item bilgilerini görüntüleyin'}
                    </CardDescription>
                  </div>
                  {isEditing && (
                    <Button onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Item Ekle
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ItemsTable
                  items={displayData.items}
                  isEditing={isEditing}
                  orderType={table.order_type}
                  onUpdateItem={updateItem}
                  onDeleteItem={deleteItem}
                  onDuplicateItem={duplicateItem}
                  onReorderItems={reorderItems}
                  onAddCity={addCityToItem}
                  onRemoveCity={removeCityFromItem}
                  onUpdateCityData={updateCityData}
                />
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

            {/* Bakiye İstatistikleri */}
            {(statistics.startBalance !== undefined || statistics.endBalance !== undefined) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Başlangıç Bakiyesi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {statistics.startBalance !== undefined ? formatCurrency(statistics.startBalance) : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bitiş Bakiyesi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {statistics.endBalance !== undefined ? formatCurrency(statistics.endBalance) : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bakiye Değişimi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${statistics.balanceChange !== undefined ? (statistics.balanceChange >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                      {statistics.balanceChange !== undefined 
                        ? `${statistics.balanceChange >= 0 ? '+' : ''}${formatCurrency(statistics.balanceChange)}`
                        : '-'}
                    </p>
                    {statistics.balanceChange !== undefined && statistics.startBalance !== undefined && statistics.startBalance > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {((statistics.balanceChange / statistics.startBalance) * 100).toFixed(2)}% değişim
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

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

            {/* Ürün Bazlı Kar/Zarar Detayları */}
            <Card>
              <CardHeader>
                <CardTitle>Ürün Bazlı Kar/Zarar Detayları</CardTitle>
                <CardDescription>
                  Her ürün için detaylı kar/zarar hesaplamaları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.itemCalculations.map((calc, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{calc.itemName || 'İsimsiz Ürün'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Tier: {calc.tier} | Quality: {calc.quality}
                          </p>
                        </div>
                        <div className={`text-right ${calc.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <p className="text-lg font-bold">
                            {formatCurrency(calc.profit)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {calc.profitMargin >= 0 ? '+' : ''}{calc.profitMargin.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                        <div>
                          <p className="text-muted-foreground">Toplam Gelir</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calc.totalRevenue)}
                          </p>
                          {calc.grossRevenue && calc.grossRevenue > calc.totalRevenue && (
                            <p className="text-xs text-muted-foreground">
                              Brüt: {formatCurrency(calc.grossRevenue)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Toplam Maliyet</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(calc.totalCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Adet</p>
                          <p className="font-semibold">{calc.quantity}</p>
                        </div>
                      </div>
                      {(calc.blackMarketTax || calc.blackMarketSetupFee || calc.buyOrderSetupFee) && (
                        <div className="pt-2 border-t space-y-1 text-xs">
                          <p className="text-muted-foreground font-semibold">Tax Detayları:</p>
                          {calc.blackMarketTax && calc.blackMarketTax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Black Market Tax:</span>
                              <span className="text-red-600">{formatCurrency(calc.blackMarketTax)}</span>
                            </div>
                          )}
                          {calc.blackMarketSetupFee && calc.blackMarketSetupFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Black Market Setup Fee:</span>
                              <span className="text-red-600">{formatCurrency(calc.blackMarketSetupFee)}</span>
                            </div>
                          )}
                          {calc.buyOrderSetupFee && calc.buyOrderSetupFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Buy Order Setup Fee:</span>
                              <span className="text-red-600">{formatCurrency(calc.buyOrderSetupFee)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {statistics.itemCalculations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Henüz ürün eklenmemiş.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* En Çok Satılan / Kar Ettiren Ürünler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">En Çok Satılan Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statistics.mostSoldItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{item.itemName}</span>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                      </div>
                    ))}
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
                        <span className="text-sm">{item.itemName}</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    ))}
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
                        <span className="text-sm">{item.itemName}</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
