import { Item, OrderType, CityData } from '@/types';
import { PREMIUM_TAX, NON_PREMIUM_TAX, MARKET_TAX, SETUP_FEE } from './constants';

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

/**
 * Calculate profit for a single item
 * 
 * Market Flip Mantığı:
 * - Normal Market'ten satın alıyoruz (maliyet)
 * - Black Market'e satıyoruz (gelir)
 * 
 * Black Market: Bizim Black Market'e sattığımız fiyat = GELİR (tax yok)
 * Normal Market: Bizim marketten satın aldığımız fiyat = MALİYET (tax yok, sadece fiyat)
 */
export function calculateItemProfit(
  item: Item,
  isPremium: boolean,
  orderType: OrderType
): ProfitCalculation {
  // Black Market'e sattığımız fiyat = GELİR (tax yok, Black Market direkt alıyor)
  const blackMarketRevenue = (item.caerleonBlackMarket.buyPrice || 0) * (item.caerleonBlackMarket.buyQuantity || 0);
  
  // Normal Market'ten satın aldığımız fiyat = MALİYET
  // Satın alırken tax ödemiyoruz, sadece fiyat ödüyoruz
  let totalCost = 0;
  let totalQuantity = 0;
  
  item.cities.forEach((city: CityData) => {
    if (orderType === 'buy_order') {
      // Buy order: Marketten buy order ile satın alıyoruz
      // Sadece setup fee var
      if (city.buyPrice && city.buyQuantity) {
        const cost = city.buyPrice * city.buyQuantity;
        const setupFee = cost * SETUP_FEE;
        totalCost += cost + setupFee; // Setup fee maliyete eklenir
        totalQuantity += city.buyQuantity;
      }
    } else {
      // Sell order: Marketten direkt satın alıyoruz (sell order yok, normal satın alma)
      // Normal satın almada tax yok, sadece fiyat öderiz
      if (city.sellPrice && city.sellQuantity) {
        const cost = city.sellPrice * city.sellQuantity;
        totalCost += cost; // Satın alırken tax yok
        totalQuantity += city.sellQuantity;
      }
    }
  });
  
  // Kar = Gelir - Maliyet
  const profit = blackMarketRevenue - totalCost;
  const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  
  return {
    itemName: item.name,
    tier: item.tier,
    quality: item.quality,
    totalCost,
    totalRevenue: blackMarketRevenue,
    profit,
    profitMargin,
    quantity: totalQuantity,
  };
}

/**
 * Calculate statistics for all items in a table
 */
export function calculateTableStatistics(
  items: Item[],
  isPremium: boolean,
  orderType: OrderType
) {
  const calculations = items.map(item => calculateItemProfit(item, isPremium, orderType));
  
  const totalProfit = calculations
    .filter(c => c.profit > 0)
    .reduce((sum, c) => sum + c.profit, 0);
  
  const totalLoss = Math.abs(calculations
    .filter(c => c.profit < 0)
    .reduce((sum, c) => sum + c.profit, 0));
  
  const netProfit = totalProfit - totalLoss;
  
  const mostSoldItems = calculations
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(c => ({ itemName: c.itemName, quantity: c.quantity }));
  
  const mostProfitableItems = calculations
    .filter(c => c.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10)
    .map(c => ({ itemName: c.itemName, profit: c.profit }));
  
  const leastProfitableItems = calculations
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 10)
    .map(c => ({ itemName: c.itemName, profit: c.profit }));
  
  return {
    totalProfit,
    totalLoss,
    netProfit,
    mostSoldItems,
    mostProfitableItems,
    leastProfitableItems,
  };
}
