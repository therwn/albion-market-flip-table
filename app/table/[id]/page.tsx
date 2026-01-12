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
import { Plus, X, ChevronDown, ChevronUp, Save, History, ArrowLeft } from 'lucide-react';
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

export default function TableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;

  const [table, setTable] = useState<Table | null>(null);
  const [versions, setVersions] = useState<TableVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Table['data'] | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [tierFilter, setTierFilter] = useState('');

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
    setExpandedItems(new Set([...expandedItems, newItem.id]));
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

  const toggleCityExpansion = (itemId: string, cityName: CityName) => {
    const key = `${itemId}-${cityName}`;
    setExpandedCities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const filteredTiers = TIERS.filter(tier =>
    tierFilter === '' || tier.startsWith(tierFilter)
  );

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
    table.order_type
  );

  const displayData = isEditing ? editedData : table.data;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
              Versiyon: v{table.version_number}
            </p>
          </div>
          <div className="flex gap-2">
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
          <CardContent className="space-y-4">
            {displayData.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Henüz item eklenmemiş.
              </p>
            ) : (
              displayData.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <Label>Item Adı</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(item.id, { name: e.target.value })}
                              placeholder="Item adını girin"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Item Tier</Label>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Tier filtrele"
                                  value={tierFilter}
                                  onChange={(e) => setTierFilter(e.target.value)}
                                />
                                <Select
                                  value={item.tier}
                                  onValueChange={(value) => updateItem(item.id, { tier: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredTiers.map((tier) => (
                                      <SelectItem key={tier} value={tier}>
                                        {tier}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label>Item Quality</Label>
                              <Select
                                value={item.quality}
                                onValueChange={(value) =>
                                  updateItem(item.id, { quality: value as ItemQuality })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUALITIES.map((quality) => (
                                    <SelectItem key={quality} value={quality}>
                                      {quality}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Tier: {item.tier} | Quality: {item.quality}
                          </p>
                        </div>
                      )}

                      {/* Caerleon Black Market */}
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-semibold">
                            Caerleon Black Market
                          </Label>
                          {isEditing && (
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`blackMarketOrder-${item.id}`} className="text-sm">
                                {item.caerleonBlackMarket.isSellOrder ? 'Sell Order' : 'Direkt Sell'}
                              </Label>
                              <Switch
                                id={`blackMarketOrder-${item.id}`}
                                checked={item.caerleonBlackMarket.isSellOrder || false}
                                onCheckedChange={(checked) => updateItem(item.id, {
                                  caerleonBlackMarket: {
                                    ...item.caerleonBlackMarket,
                                    isSellOrder: checked,
                                  },
                                })}
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Alış Fiyatı</Label>
                            {isEditing ? (
                              <Input
                                value={item.caerleonBlackMarket.buyPrice ? formatNumberInput(item.caerleonBlackMarket.buyPrice.toString()) : ''}
                                onChange={(e) => {
                                  const value = parseFormattedNumber(e.target.value);
                                  updateItem(item.id, {
                                    caerleonBlackMarket: {
                                      ...item.caerleonBlackMarket,
                                      buyPrice: value,
                                    },
                                  });
                                }}
                                placeholder="0"
                              />
                            ) : (
                              <p className="text-sm py-2">
                                {item.caerleonBlackMarket.buyPrice ? formatNumber(item.caerleonBlackMarket.buyPrice) : '0'}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">Black Market&apos;in aldığı fiyat</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Alış Adedi</Label>
                            {isEditing ? (
                              <Input
                                value={item.caerleonBlackMarket.buyQuantity ? formatNumberInput(item.caerleonBlackMarket.buyQuantity.toString()) : ''}
                                onChange={(e) => {
                                  const value = parseFormattedNumber(e.target.value);
                                  updateItem(item.id, {
                                    caerleonBlackMarket: {
                                      ...item.caerleonBlackMarket,
                                      buyQuantity: Math.floor(value),
                                    },
                                  });
                                }}
                                placeholder="0"
                              />
                            ) : (
                              <p className="text-sm py-2">
                                {item.caerleonBlackMarket.buyQuantity ? formatNumber(item.caerleonBlackMarket.buyQuantity) : '0'}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">Black Market&apos;in aldığı maksimum adet</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Satış Adedi</Label>
                            {isEditing ? (
                              <Input
                                value={item.caerleonBlackMarket.sellQuantity ? formatNumberInput(item.caerleonBlackMarket.sellQuantity.toString()) : ''}
                                onChange={(e) => {
                                  const value = parseFormattedNumber(e.target.value);
                                  updateItem(item.id, {
                                    caerleonBlackMarket: {
                                      ...item.caerleonBlackMarket,
                                      sellQuantity: Math.floor(value),
                                    },
                                  });
                                }}
                                placeholder="0"
                              />
                            ) : (
                              <p className="text-sm py-2">
                                {item.caerleonBlackMarket.sellQuantity ? formatNumber(item.caerleonBlackMarket.sellQuantity) : '0'}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">Bizim Black Market&apos;e sattığımız adet</p>
                          </div>
                        </div>
                        {isEditing && (
                          <p className="text-xs text-muted-foreground">
                            {item.caerleonBlackMarket.isSellOrder 
                              ? 'Sell Order: Premium Tax (%4/%8) + Setup Fee (%2.5) düşülecek'
                              : 'Direkt Sell: Sadece Premium Tax (%4/%8) düşülecek'}
                          </p>
                        )}
                      </div>

                      {/* Market Bilgileri */}
                      <div className="border-t pt-4">
                        <Label className="text-base font-semibold mb-2 block">
                          Market Bilgileri
                        </Label>
                        <div className="space-y-2">
                          {CITIES.filter(c => c !== 'Caerleon').map((city) => {
                            const cityData = item.cities.find(c => c.name === city);
                            const isExpanded = expandedCities.has(`${item.id}-${city}`);

                            return (
                              <div key={city} className="border rounded p-2">
                                {!cityData ? (
                                  isEditing ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => addCityToItem(item.id, city)}
                                      className="w-full justify-start"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      {city}
                                    </Button>
                                  ) : null
                                ) : (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">{city}</span>
                                      {isEditing && (
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCityExpansion(item.id, city)}
                                          >
                                            {isExpanded ? (
                                              <ChevronUp className="h-4 w-4" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4" />
                                            )}
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCityFromItem(item.id, city)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    {(isExpanded || !isEditing) && (
                                      <div className="grid grid-cols-2 gap-4 mt-4">
                                        {displayData.orderType === 'buy_order' ? (
                                          <>
                                            <div className="space-y-2">
                                              <Label>Buy Order Fiyatı</Label>
                                              {isEditing ? (
                                                <Input
                                                  value={cityData.buyPrice ? formatNumberInput(cityData.buyPrice.toString()) : ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'buyPrice',
                                                    parseFormattedNumber(e.target.value)
                                                  )}
                                                  placeholder="0"
                                                />
                                              ) : (
                                                <p className="text-sm py-2">
                                                  {cityData.buyPrice ? formatNumber(cityData.buyPrice) : '-'}
                                                </p>
                                              )}
                                              <p className="text-xs text-muted-foreground">Bizim buy order oluşturduğumuz ücret</p>
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Buy Order Adedi</Label>
                                              {isEditing ? (
                                                <Input
                                                  value={cityData.buyQuantity ? formatNumberInput(cityData.buyQuantity.toString()) : ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'buyQuantity',
                                                    Math.floor(parseFormattedNumber(e.target.value))
                                                  )}
                                                  placeholder="0"
                                                />
                                              ) : (
                                                <p className="text-sm py-2">
                                                  {cityData.buyQuantity ? formatNumber(cityData.buyQuantity) : '-'}
                                                </p>
                                              )}
                                              <p className="text-xs text-muted-foreground">Bizim satın almak için oluşturduğumuz toplam adet</p>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="space-y-2">
                                              <Label>Satış Fiyatı</Label>
                                              {isEditing ? (
                                                <Input
                                                  value={cityData.sellPrice ? formatNumberInput(cityData.sellPrice.toString()) : ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'sellPrice',
                                                    parseFormattedNumber(e.target.value)
                                                  )}
                                                  placeholder="0"
                                                />
                                              ) : (
                                                <p className="text-sm py-2">
                                                  {cityData.sellPrice ? formatNumber(cityData.sellPrice) : '-'}
                                                </p>
                                              )}
                                              <p className="text-xs text-muted-foreground">Bizim satın aldığımız, Market&apos;in sattığı fiyat</p>
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Alış Adeti</Label>
                                              {isEditing ? (
                                                <Input
                                                  value={cityData.sellQuantity ? formatNumberInput(cityData.sellQuantity.toString()) : ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'sellQuantity',
                                                    Math.floor(parseFormattedNumber(e.target.value))
                                                  )}
                                                  placeholder="0"
                                                />
                                              ) : (
                                                <p className="text-sm py-2">
                                                  {cityData.sellQuantity ? formatNumber(cityData.sellQuantity) : '-'}
                                                </p>
                                              )}
                                              <p className="text-xs text-muted-foreground">Marketten satın aldığımız adet</p>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
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
                  <p className={`text-2xl font-bold ${displayData.items.length > 0 ? (statistics.netProfit / displayData.items.length >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                    {displayData.items.length > 0 
                      ? formatCurrency(statistics.netProfit / displayData.items.length)
                      : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {displayData.items.length} ürün için ortalama
                  </p>
                </CardContent>
              </Card>
            </div>

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
