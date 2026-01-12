import { Item, OrderType, CityData, ProfitCalculation } from '@/types';
import { PREMIUM_TAX, NON_PREMIUM_TAX, MARKET_TAX, SETUP_FEE } from './constants';

/**
 * Calculate profit for a single item
 * 
 * Market Flip Mantığı:
 * - Normal Market'ten satın alıyoruz (maliyet)
 * - Black Market'e satıyoruz (gelir)
 * 
 * Buy Order Kapalı (Sell Order):
 * - Black Market: buyPrice = Black Market'in aldığı fiyat (bizim sattığımız), sellQuantity = bizim sattığımız adet
 * - Normal Market: sellPrice = Market'in sattığı fiyat (bizim satın aldığımız), sellQuantity = bizim satın aldığımız adet
 * 
 * Buy Order Açık:
 * - Black Market: Aynı
 * - Normal Market: buyPrice = Buy order fiyatı, buyQuantity = Buy order adedi
 * 
 * Tax Mantığı:
 * - Satın alırken: Tax yok
 * - Buy order'da: Setup fee var (%2.5)
 * - Satarken: Tax var (Premium %4, Premiumsuz %8) + Setup fee (%2.5)
 */
export function calculateItemProfit(
  item: Item,
  isPremium: boolean,
  orderType: OrderType
): ProfitCalculation {
  const taxRate = isPremium ? PREMIUM_TAX : NON_PREMIUM_TAX;
  
  // Black Market'e sattığımız = GELİR
  // buyPrice = Black Market'in aldığı fiyat (bizim sattığımız)
  // sellQuantity = Bizim Black Market'e sattığımız adet
  const blackMarketRevenue = (item.caerleonBlackMarket.buyPrice || 0) * (item.caerleonBlackMarket.sellQuantity || 0);
  
  // Normal Market'ten satın aldığımız = MALİYET
  let totalCost = 0;
  let totalQuantity = 0;
  
  item.cities.forEach((city: CityData) => {
    if (orderType === 'buy_order') {
      // Buy Order: Marketten buy order ile satın alıyoruz
      // buyPrice = Buy order fiyatı, buyQuantity = Buy order adedi
      // Setup fee var (%2.5)
      if (city.buyPrice && city.buyQuantity) {
        const cost = city.buyPrice * city.buyQuantity;
        const setupFee = cost * SETUP_FEE;
        totalCost += cost + setupFee; // Setup fee maliyete eklenir
        totalQuantity += city.buyQuantity;
      }
    } else {
      // Sell Order: Marketten direkt satın alıyoruz
      // sellPrice = Market'in sattığı fiyat (bizim satın aldığımız)
      // sellQuantity = Bizim satın aldığımız adet
      // Satın alırken tax yok, sadece fiyat öderiz
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
    itemCalculations: calculations, // Tekli ürün bazlı hesaplamalar
  };
}
