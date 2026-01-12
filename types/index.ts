// Type definitions for the application

export type ItemQuality = 'Normal' | 'Good' | 'Outstanding' | 'Excellent' | 'Masterpiece';

export type OrderType = 'buy_order' | 'sell_order';

export type CityName = 
  | 'Fort Sterling' 
  | 'Thetford' 
  | 'Martlock' 
  | 'Bridgewatch' 
  | 'Lymhurst' 
  | 'Caerleon';

export interface CityData {
  name: CityName;
  buyPrice?: number;
  buyQuantity?: number;
  sellPrice?: number;
  sellQuantity?: number;
}

export interface Item {
  id: string;
  name: string;
  tier: string; // e.g., "4.0", "4.1", "8.4"
  quality: ItemQuality;
  cities: CityData[];
  caerleonBlackMarket: {
    buyPrice: number; // Black Market'in aldığı fiyat (bizim sattığımız)
    buyQuantity: number; // Black Market'in aldığı maksimum adet
    sellQuantity: number; // Bizim Black Market'e sattığımız adet
  };
}

export interface TableData {
  items: Item[];
  isPremium: boolean;
  orderType: OrderType;
}

export interface Table {
  id: string;
  table_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
  order_type: OrderType;
  data: TableData;
  version_number: number;
}

export interface TableVersion {
  id: string;
  table_id: string;
  version_number: number;
  created_at: string;
  data: TableData;
}

export interface Statistics {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  mostSoldItems: Array<{ itemName: string; quantity: number }>;
  mostProfitableItems: Array<{ itemName: string; profit: number }>;
  leastProfitableItems: Array<{ itemName: string; profit: number }>;
  itemCalculations: Array<ProfitCalculation>;
}

export interface ProfitCalculation {
  itemName: string;
  tier: string;
  quality: string;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
  quantity: number;
}

export interface TimeRangeStatistics {
  period: '3days' | '1week' | '2weeks' | '1month';
  averageProfit: number;
  averageLoss: number;
  averageNetProfit: number;
  totalTransactions: number;
}
