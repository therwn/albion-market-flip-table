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
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function CreateTablePage() {
  const router = useRouter();
  const [createdBy, setCreatedBy] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('sell_order');
  const [items, setItems] = useState<Item[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [tierFilter, setTierFilter] = useState('');

  const filteredTiers = TIERS.filter(tier => 
    tierFilter === '' || tier.startsWith(tierFilter)
  );

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
          created_by: createdBy,
          data: tableData,
          is_premium: isPremium,
          order_type: orderType,
        }),
      });

      if (!response.ok) {
        throw new Error('Tablo oluşturulamadı');
      }

      const table = await response.json();
      router.push(`/table/${table.id}`);
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Tablo oluşturulurken bir hata oluştu.');
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
              <div>
                <Label htmlFor="createdBy">Tabloyu Oluşturan Kişi</Label>
                <Input
                  id="createdBy"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="İsim girin"
                  required
                />
              </div>
              <div>
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
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
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
                                placeholder="Tier filtrele (örn: 4)"
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

                        {/* Caerleon Black Market */}
                        <div className="border-t pt-4">
                          <Label className="text-base font-semibold">
                            Caerleon Black Market
                          </Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label>Alış Fiyatı</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.caerleonBlackMarket.buyPrice || ''}
                                onChange={(e) => updateItem(item.id, {
                                  caerleonBlackMarket: {
                                    ...item.caerleonBlackMarket,
                                    buyPrice: parseFloat(e.target.value) || 0,
                                  },
                                })}
                              />
                            </div>
                            <div>
                              <Label>Alış Adedi</Label>
                              <Input
                                type="number"
                                min="0"
                                value={item.caerleonBlackMarket.buyQuantity || ''}
                                onChange={(e) => updateItem(item.id, {
                                  caerleonBlackMarket: {
                                    ...item.caerleonBlackMarket,
                                    buyQuantity: parseInt(e.target.value) || 0,
                                  },
                                })}
                              />
                            </div>
                          </div>
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
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                          {orderType === 'buy_order' ? (
                                            <>
                                              <div>
                                                <Label>Market Satış Fiyatı</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={cityData.buyPrice || ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'buyPrice',
                                                    parseFloat(e.target.value) || 0
                                                  )}
                                                />
                                              </div>
                                              <div>
                                                <Label>Market Alış Adedi</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={cityData.buyQuantity || ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'buyQuantity',
                                                    parseInt(e.target.value) || 0
                                                  )}
                                                />
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div>
                                                <Label>Market Satış Fiyatı</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={cityData.sellPrice || ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'sellPrice',
                                                    parseFloat(e.target.value) || 0
                                                  )}
                                                />
                                              </div>
                                              <div>
                                                <Label>Market Alış Adedi</Label>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={cityData.sellQuantity || ''}
                                                  onChange={(e) => updateCityData(
                                                    item.id,
                                                    city,
                                                    'sellQuantity',
                                                    parseInt(e.target.value) || 0
                                                  )}
                                                />
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
