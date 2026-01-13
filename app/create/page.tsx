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
import { ThemeToggle } from '@/components/theme-toggle';
import { ItemsTable } from '@/components/items-table';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Yeni Tablo Oluştur</h1>
          <ThemeToggle />
        </div>

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
            <CardContent>
              <ItemsTable
                items={items}
                isEditing={true}
                orderType={orderType}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onAddCity={addCityToItem}
                onRemoveCity={removeCityFromItem}
                onUpdateCityData={updateCityData}
                tierFilter={tierFilters[Object.keys(tierFilters)[0]] || ''}
                onTierFilterChange={(value) => {
                  // Use first item's tier filter or create a global one
                  const firstItemId = items.length > 0 ? items[0].id : '';
                  if (firstItemId) {
                    setTierFilters(prev => ({ ...prev, [firstItemId]: value }));
                  }
                }}
              />
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
