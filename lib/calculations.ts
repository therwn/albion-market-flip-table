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
 */
export function calculateItemProfit(
  item: Item,
  isPremium: boolean,
  orderType: OrderType
): ProfitCalculation {
  const taxRate = isPremium ? PREMIUM_TAX : NON_PREMIUM_TAX;
  
  // Calculate total cost from Caerleon Black Market
  const caerleonCost = (item.caerleonBlackMarket.buyPrice || 0) * (item.caerleonBlackMarket.buyQuantity || 0);
  
  // Calculate total revenue from cities
  let totalRevenue = 0;
  let totalQuantity = 0;
  
  item.cities.forEach((city: CityData) => {
    if (orderType === 'buy_order') {
      // Buy order: only setup fee
      if (city.buyPrice && city.buyQuantity) {
        const revenue = city.buyPrice * city.buyQuantity;
        const setupFee = revenue * SETUP_FEE;
        totalRevenue += revenue - setupFee;
        totalQuantity += city.buyQuantity;
      }
    } else {
      // Sell order: tax + setup fee
      if (city.sellPrice && city.sellQuantity) {
        const revenue = city.sellPrice * city.sellQuantity;
        const tax = revenue * taxRate;
        const setupFee = revenue * SETUP_FEE;
        totalRevenue += revenue - tax - setupFee;
        totalQuantity += city.sellQuantity;
      }
    }
  });
  
  const profit = totalRevenue - caerleonCost;
  const profitMargin = caerleonCost > 0 ? (profit / caerleonCost) * 100 : 0;
  
  return {
    itemName: item.name,
    tier: item.tier,
    quality: item.quality,
    totalCost: caerleonCost,
    totalRevenue,
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
