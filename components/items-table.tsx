'use client';

import { Item, CityName, ItemQuality, OrderType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TIERS, QUALITIES, CITIES } from '@/lib/constants';
import { formatNumberInput, parseFormattedNumber, formatNumber } from '@/lib/format';
import { getTierBackgroundColor } from '@/lib/tier-colors';
import { Plus, X, Copy, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemsTableProps {
  items: Item[];
  isEditing: boolean;
  orderType: OrderType;
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
  onDuplicateItem?: (itemId: string) => void;
  onReorderItems?: (startIndex: number, endIndex: number) => void;
  onAddCity: (itemId: string, cityName: CityName) => void;
  onRemoveCity: (itemId: string, cityName: CityName) => void;
  onUpdateCityData: (
    itemId: string,
    cityName: CityName,
    field: 'buyPrice' | 'buyQuantity' | 'sellPrice' | 'sellQuantity',
    value: number
  ) => void;
}

interface SortableRowProps {
  item: Item;
  index: number;
  isEditing: boolean;
  orderType: OrderType;
  citiesWithoutCaerleon: CityName[];
  onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (itemId: string) => void;
  onDuplicateItem?: (itemId: string) => void;
  onAddCity: (itemId: string, cityName: CityName) => void;
  onRemoveCity: (itemId: string, cityName: CityName) => void;
  onUpdateCityData: (
    itemId: string,
    cityName: CityName,
    field: 'buyPrice' | 'buyQuantity' | 'sellPrice' | 'sellQuantity',
    value: number
  ) => void;
}

function SortableRow({
  item,
  index,
  isEditing,
  orderType,
  citiesWithoutCaerleon,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onAddCity,
  onRemoveCity,
  onUpdateCityData,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cityDataMap = new Map(
    item.cities.map(city => [city.name, city])
  );

  const tierBgColor = getTierBackgroundColor(item.tier);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b ${tierBgColor} ${isDragging ? 'z-50 opacity-50' : 'hover:bg-muted/50'}`}
    >
      {isEditing && (
        <td className="p-2">
          <div className="flex items-center gap-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
              title="Sürükle"
              type="button"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground pointer-events-none" />
            </button>
            {onDuplicateItem && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDuplicateItem(item.id)}
                title="Kopyala"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => onDeleteItem(item.id)}
              title="Sil"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
}

export function ItemsTable({
  items,
  isEditing,
  orderType,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onReorderItems,
  onAddCity,
  onRemoveCity,
  onUpdateCityData,
}: ItemsTableProps) {
  const citiesWithoutCaerleon = CITIES.filter(c => c !== 'Caerleon');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px hareket ettikten sonra drag başlasın
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderItems) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorderItems(oldIndex, newIndex);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Henüz item eklenmemiş.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {isEditing && <th className="p-2 text-left min-w-[120px]">İşlemler</th>}
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
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={index}
                  isEditing={isEditing}
                  orderType={orderType}
                  citiesWithoutCaerleon={citiesWithoutCaerleon}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  onDuplicateItem={onDuplicateItem}
                  onAddCity={onAddCity}
                  onRemoveCity={onRemoveCity}
                  onUpdateCityData={onUpdateCityData}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
