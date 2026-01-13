'use client';

import { Item, CityName, ItemQuality, OrderType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TIERS, QUALITIES, CITIES } from '@/lib/constants';
import { formatNumberInput, parseFormattedNumber, formatNumber } from '@/lib/format';
import { Plus, X } from 'lucide-react';

interface ItemsTableProps {
  items: Item[];
  isEditing: boolean;
  orderType: OrderType;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddCity: (itemId: string, cityName: CityName) => void;
  onRemoveCity: (itemId: string, cityName: CityName) => void;
  onUpdateCityData: (
    itemId: string,
    cityName: CityName,
    field: 'buyPrice' | 'buyQuantity' | 'sellPrice' | 'sellQuantity',
    value: number
  ) => void;
}

export function ItemsTable({
  items,
  isEditing,
  orderType,
  onUpdateItem,
  onDeleteItem,
  onAddCity,
  onRemoveCity,
  onUpdateCityData,
}: ItemsTableProps) {

  const citiesWithoutCaerleon = CITIES.filter(c => c !== 'Caerleon');

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Henüz item eklenmemiş.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {isEditing && <th className="p-2 text-left min-w-[50px]">Sil</th>}
            <th className="p-2 text-left min-w-[200px]">Item Adı</th>
            <th className="p-2 text-left min-w-[100px]">Tier</th>
            <th className="p-2 text-left min-w-[120px]">Quality</th>
            <th className="p-2 text-left min-w-[150px]">BM Alış Fiyatı</th>
            <th className="p-2 text-left min-w-[120px]">BM Alış Adedi</th>
            <th className="p-2 text-left min-w-[120px]">BM Satış Adedi</th>
            <th className="p-2 text-left min-w-[100px]">BM Order Tipi</th>
            {citiesWithoutCaerleon.map((city) => (
              <th key={city} className="p-2 text-left min-w-[200px]">
                {city}
                {orderType === 'buy_order' ? ' (Buy)' : ' (Sell)'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const cityDataMap = new Map(
              item.cities.map(city => [city.name, city])
            );

            return (
              <tr key={item.id} className="border-b hover:bg-muted/50">
                {isEditing && (
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                )}
                <td className="p-2">
                  {isEditing ? (
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                      placeholder="Item adı"
                      className="min-w-[180px]"
                    />
                  ) : (
                    <span className="font-medium">{item.name || 'İsimsiz Item'}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <Select
                      value={item.tier}
                      onValueChange={(value) => onUpdateItem(item.id, { tier: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                        <SelectContent>
                          {TIERS.map((tier) => (
                            <SelectItem key={tier} value={tier}>
                              {tier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  ) : (
                    <span>{item.tier}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <Select
                      value={item.quality}
                      onValueChange={(value) =>
                        onUpdateItem(item.id, { quality: value as ItemQuality })
                      }
                    >
                      <SelectTrigger className="h-8">
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
                  ) : (
                    <span>{item.quality}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <Input
                      value={item.caerleonBlackMarket.buyPrice ? formatNumberInput(item.caerleonBlackMarket.buyPrice.toString()) : ''}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        onUpdateItem(item.id, {
                          caerleonBlackMarket: {
                            ...item.caerleonBlackMarket,
                            buyPrice: value,
                          },
                        });
                      }}
                      placeholder="0"
                      className="h-8"
                    />
                  ) : (
                    <span>{item.caerleonBlackMarket.buyPrice ? formatNumber(item.caerleonBlackMarket.buyPrice) : '-'}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <Input
                      value={item.caerleonBlackMarket.buyQuantity ? formatNumberInput(item.caerleonBlackMarket.buyQuantity.toString()) : ''}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        onUpdateItem(item.id, {
                          caerleonBlackMarket: {
                            ...item.caerleonBlackMarket,
                            buyQuantity: Math.floor(value),
                          },
                        });
                      }}
                      placeholder="0"
                      className="h-8"
                    />
                  ) : (
                    <span>{item.caerleonBlackMarket.buyQuantity ? formatNumber(item.caerleonBlackMarket.buyQuantity) : '-'}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <Input
                      value={item.caerleonBlackMarket.sellQuantity ? formatNumberInput(item.caerleonBlackMarket.sellQuantity.toString()) : ''}
                      onChange={(e) => {
                        const value = parseFormattedNumber(e.target.value);
                        onUpdateItem(item.id, {
                          caerleonBlackMarket: {
                            ...item.caerleonBlackMarket,
                            sellQuantity: Math.floor(value),
                          },
                        });
                      }}
                      placeholder="0"
                      className="h-8"
                    />
                  ) : (
                    <span>{item.caerleonBlackMarket.sellQuantity ? formatNumber(item.caerleonBlackMarket.sellQuantity) : '-'}</span>
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">
                        {item.caerleonBlackMarket.isSellOrder ? 'Sell Order' : 'Direkt Sell'}
                      </Label>
                      <Switch
                        checked={item.caerleonBlackMarket.isSellOrder || false}
                        onCheckedChange={(checked) => onUpdateItem(item.id, {
                          caerleonBlackMarket: {
                            ...item.caerleonBlackMarket,
                            isSellOrder: checked,
                          },
                        })}
                      />
                    </div>
                  ) : (
                    <span className="text-xs">
                      {item.caerleonBlackMarket.isSellOrder ? 'Sell Order' : 'Direkt Sell'}
                    </span>
                  )}
                </td>
                {citiesWithoutCaerleon.map((city) => {
                  const cityData = cityDataMap.get(city);

                  return (
                    <td key={city} className="p-2">
                      {!cityData ? (
                        isEditing ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onAddCity(item.id, city)}
                            className="h-8 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ekle
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )
                      ) : (
                        <div className="flex items-end gap-1">
                          {orderType === 'buy_order' ? (
                            <>
                              <div className="flex-1">
                                <Label className="text-xs">Fiyat</Label>
                                {isEditing ? (
                                  <Input
                                    value={cityData.buyPrice ? formatNumberInput(cityData.buyPrice.toString()) : ''}
                                    onChange={(e) => onUpdateCityData(
                                      item.id,
                                      city,
                                      'buyPrice',
                                      parseFormattedNumber(e.target.value)
                                    )}
                                    placeholder="0"
                                    className="h-7 text-xs"
                                  />
                                ) : (
                                  <div className="text-xs">{cityData.buyPrice ? formatNumber(cityData.buyPrice) : '-'}</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs">Adet</Label>
                                {isEditing ? (
                                  <Input
                                    value={cityData.buyQuantity ? formatNumberInput(cityData.buyQuantity.toString()) : ''}
                                    onChange={(e) => onUpdateCityData(
                                      item.id,
                                      city,
                                      'buyQuantity',
                                      Math.floor(parseFormattedNumber(e.target.value))
                                    )}
                                    placeholder="0"
                                    className="h-7 text-xs"
                                  />
                                ) : (
                                  <div className="text-xs">{cityData.buyQuantity ? formatNumber(cityData.buyQuantity) : '-'}</div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <Label className="text-xs">Fiyat</Label>
                                {isEditing ? (
                                  <Input
                                    value={cityData.sellPrice ? formatNumberInput(cityData.sellPrice.toString()) : ''}
                                    onChange={(e) => onUpdateCityData(
                                      item.id,
                                      city,
                                      'sellPrice',
                                      parseFormattedNumber(e.target.value)
                                    )}
                                    placeholder="0"
                                    className="h-7 text-xs"
                                  />
                                ) : (
                                  <div className="text-xs">{cityData.sellPrice ? formatNumber(cityData.sellPrice) : '-'}</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs">Adet</Label>
                                {isEditing ? (
                                  <Input
                                    value={cityData.sellQuantity ? formatNumberInput(cityData.sellQuantity.toString()) : ''}
                                    onChange={(e) => onUpdateCityData(
                                      item.id,
                                      city,
                                      'sellQuantity',
                                      Math.floor(parseFormattedNumber(e.target.value))
                                    )}
                                    placeholder="0"
                                    className="h-7 text-xs"
                                  />
                                ) : (
                                  <div className="text-xs">{cityData.sellQuantity ? formatNumber(cityData.sellQuantity) : '-'}</div>
                                )}
                              </div>
                            </>
                          )}
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveCity(item.id, city)}
                              className="h-7 w-7 p-0 shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
