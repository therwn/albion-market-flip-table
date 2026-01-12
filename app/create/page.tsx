'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, TableData, OrderType, CityName, ItemQuality } from '@/types';
import { TIERS, QUALITIES, CITIES } from '@/lib/constants';
import { getTurkeyDateTime, formatTurkeyDateTime } from '@/lib/date-utils';
import { formatNumberInput, parseFormattedNumber } from '@/lib/format';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function CreateTablePage() {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('sell_order');
  const [items, setItems] = useState<Item[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [tierFilters, setTierFilters] = useState<Record<string, string>>({});
  const [openSelects, setOpenSelects] = useState<Record<string, boolean>>({});

  const getFilteredTiers = (itemId: string) => {
    const filter = tierFilters[itemId] || '';
    return TIERS.filter(tier => 
      filter === '' || tier.startsWith(filter)
    );
  };

  const addItem = () => {
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
    setItems([...items, newItem]);
    setExpandedItems(new Set([...expandedItems, newItem.id]));
  };

  const updateItem = (itemId: string, updates: Partial<Item>) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const addCityToItem = (itemId: string, cityName: CityName) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const cityExists = item.cities.some(c => c.name === cityName);
    if (cityExists) return;

    const newCity = {
      name: cityName,
      buyPrice: orderType === 'buy_order' ? 0 : undefined,
      buyQuantity: orderType === 'buy_order' ? 0 : undefined,
      sellPrice: orderType === 'sell_order' ? 0 : undefined,
      sellQuantity: orderType === 'sell_order' ? 0 : undefined,
    };

    updateItem(itemId, {
      cities: [...item.cities, newCity],
    });
  };

  const removeCityFromItem = (itemId: string, cityName: CityName) => {
    const item = items.find(i => i.id === itemId);
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
    const item = items.find(i => i.id === itemId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdBy.trim()) {
      alert('Lütfen tabloyu oluşturan kişinin adını girin.');
      return;
    }

    const tableData: TableData = {
      items,
      isPremium,
      orderType,
    };

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: tableName || null,
          created_by: createdBy,
          data: tableData,
          is_premium: isPremium,
          order_type: orderType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Tablo oluşturulamadı');
      }

      const table = await response.json();
      router.push(`/table/${table.id}`);
    } catch (error: any) {
      console.error('Error creating table:', error);
      alert(`Tablo oluşturulurken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Yeni Tablo Oluştur</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tablo Detay Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Tablo Detay Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Tablo Adı</Label>
                <Input
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Tablo adını girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdBy">Tabloyu Oluşturan Kişi</Label>
                <Input
                  id="createdBy"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="İsim girin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Oluşturulma Tarihi ve Saati</Label>
                <Input
                  value={formatTurkeyDateTime(getTurkeyDateTime())}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Market Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle>Market Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="premium">Premium</Label>
                  <p className="text-sm text-muted-foreground">
                    Premium: %4 Tax, Premiumsuz: %8 Tax
                  </p>
                </div>
                <Switch
                  id="premium"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orderType">Buy Order / Sell Order</Label>
                  <p className="text-sm text-muted-foreground">
                    {orderType === 'buy_order' 
                      ? 'Buy Order: Sadece Setup Fee (%2.5)'
                      : 'Sell Order: Tax + Setup Fee (%2.5)'}
                  </p>
                </div>
                <Switch
                  id="orderType"
                  checked={orderType === 'buy_order'}
                  onCheckedChange={(checked) => 
                    setOrderType(checked ? 'buy_order' : 'sell_order')
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Item Listesi */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Item Detay Bilgileri</CardTitle>
                  <CardDescription>
                    Tabloya item ekleyin ve market bilgilerini girin
                  </CardDescription>
                </div>
                <Button type="button" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Item Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Henüz item eklenmedi. Item eklemek için yukarıdaki butona tıklayın.
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                          <Label>Item Adı</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            placeholder="Item adını girin"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Item Tier</Label>
                            <Select
                              value={item.tier}
                              onValueChange={(value) => {
                                updateItem(item.id, { tier: value });
                                setTierFilters(prev => ({ ...prev, [item.id]: '' }));
                              }}
                              onOpenChange={(open) => {
                                setOpenSelects(prev => ({ ...prev, [item.id]: open }));
                                if (!open) {
                                  setTierFilters(prev => ({ ...prev, [item.id]: '' }));
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tier seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="p-2 border-b">
                                  <Input
                                    placeholder="Tier filtrele (örn: 4)"
                                    value={tierFilters[item.id] || ''}
                                    onChange={(e) => {
                                      setTierFilters(prev => ({ ...prev, [item.id]: e.target.value }));
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {getFilteredTiers(item.id).map((tier) => (
                                  <SelectItem key={tier} value={tier}>
                                    {tier}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
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

                        {/* Caerleon Black Market */}
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">
                              Caerleon Black Market
                            </Label>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`blackMarketOrder-${item.id}`} className="text-sm">
                                {item.caerleonBlackMarket.isSellOrder ? 'Sell Order' : 'Direkt Sell'}
                              </Label>
                              <Switch
                                id={`blackMarketOrder-${item.id}`}
                                checked={item.caerleonBlackMarket.isSellOrder}
                                onCheckedChange={(checked) => updateItem(item.id, {
                                  caerleonBlackMarket: {
                                    ...item.caerleonBlackMarket,
                                    isSellOrder: checked,
                                  },
                                })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Alış Fiyatı</Label>
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
                              <p className="text-xs text-muted-foreground">Black Market&apos;in aldığı fiyat</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Alış Adedi</Label>
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
                              <p className="text-xs text-muted-foreground">Black Market&apos;in aldığı maksimum adet</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Satış Adedi</Label>
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
                              <p className="text-xs text-muted-foreground">Bizim Black Market&apos;e sattığımız adet</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.caerleonBlackMarket.isSellOrder 
                              ? 'Sell Order: Premium Tax (%4/%8) + Setup Fee (%2.5) düşülecek'
                              : 'Direkt Sell: Sadece Premium Tax (%4/%8) düşülecek'}
                          </p>
                        </div>

                        {/* Market Bilgileri */}
                        <div className="border-t pt-4 space-y-4">
                          <Label className="text-base font-semibold block">
                            Market Bilgileri
                          </Label>
                          <div className="space-y-2">
                            {CITIES.filter(c => c !== 'Caerleon').map((city) => {
                              const cityData = item.cities.find(c => c.name === city);
                              const isExpanded = expandedCities.has(`${item.id}-${city}`);
                              
                              return (
                                <div key={city} className="border rounded p-2">
                                  {!cityData ? (
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
                                  ) : (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">{city}</span>
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
                                      </div>
                                      {isExpanded && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                          {orderType === 'buy_order' ? (
                                            <>
                                              <div className="space-y-2">
                                                <Label>Buy Order Fiyatı</Label>
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
                                                <p className="text-xs text-muted-foreground">Bizim buy order oluşturduğumuz ücret</p>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Buy Order Adedi</Label>
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
                                                <p className="text-xs text-muted-foreground">Bizim satın almak için oluşturduğumuz toplam adet</p>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div className="space-y-2">
                                                <Label>Satış Fiyatı</Label>
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
                                                <p className="text-xs text-muted-foreground">Bizim satın aldığımız, Market&apos;in sattığı fiyat</p>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>Alış Adeti</Label>
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
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
