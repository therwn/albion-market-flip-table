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
 *   NOT: Black Market'e satarken tax YOK (Black Market direkt alıyor)
 * - Normal Market: sellPrice = Market'in sattığı fiyat (bizim satın aldığımız), sellQuantity = bizim satın aldığımız adet
 *   NOT: Satın alırken tax YOK
 * 
 * Buy Order Açık:
 * - Black Market: Aynı (tax yok)
 * - Normal Market: buyPrice = Buy order fiyatı, buyQuantity = Buy order adedi
 *   NOT: Buy order'da Setup fee var (%2.5)
 * 
 * Tax Mantığı (Albion Online):
 * - Satın alırken: Tax YOK ✓
 * - Buy order oluştururken: Setup fee var (%2.5) ✓
 * - Normal Market'e satarken: Tax var (Premium %4, Premiumsuz %8) + Setup fee (%2.5)
 * - Black Market'e satarken: Tax YOK (Black Market direkt alıyor) ✓
 * 
 * NOT: Kullanıcının girdiği fiyatlar NET fiyatlar (tax dahil değil)
 * - Black Market Alış Fiyatı: Black Market'in ödediği fiyat (bizim alacağımız net gelir, tax yok)
 * - Normal Market Satış Fiyatı: Market'in sattığı fiyat (bizim ödeyeceğimiz net maliyet, tax yok)
 */
export function calculateItemProfit(
  item: Item,
  isPremium: boolean,
  orderType: OrderType
): ProfitCalculation {
  const taxRate = isPremium ? PREMIUM_TAX : NON_PREMIUM_TAX;
  
  // Black Market'e sattığımız = GELİR
  // buyPrice = Black Market'in aldığı fiyat (BRÜT gelir, tax düşülecek)
  // sellQuantity = Bizim Black Market'e sattığımız adet
  // isSellOrder = true ise Sell Order (tax + setup fee), false ise Direkt Sell (sadece tax)
  const grossRevenue = (item.caerleonBlackMarket.buyPrice || 0) * (item.caerleonBlackMarket.sellQuantity || 0);
  
  // Black Market tax hesaplaması
  const blackMarketTax = grossRevenue * taxRate; // Premium %4 veya Premiumsuz %8
  const blackMarketSetupFee = item.caerleonBlackMarket.isSellOrder ? grossRevenue * SETUP_FEE : 0; // Sell Order ise setup fee var
  const blackMarketRevenue = grossRevenue - blackMarketTax - blackMarketSetupFee; // NET gelir
  
  // Normal Market'ten satın aldığımız = MALİYET
  let totalCost = 0;
  let totalQuantity = 0;
  
  item.cities.forEach((city: CityData) => {
    if (orderType === 'buy_order') {
      // Buy Order: Marketten buy order ile satın alıyoruz
      // buyPrice = Buy order fiyatı (NET), buyQuantity = Buy order adedi
      // Setup fee var (%2.5) - bu maliyete eklenir
      if (city.buyPrice && city.buyQuantity) {
        const baseCost = city.buyPrice * city.buyQuantity;
        const setupFee = baseCost * SETUP_FEE; // %2.5 setup fee
        totalCost += baseCost + setupFee; // Setup fee maliyete eklenir
        totalQuantity += city.buyQuantity;
      }
    } else {
      // Sell Order: Marketten direkt satın alıyoruz
      // sellPrice = Market'in sattığı fiyat (NET, bizim satın aldığımız)
      // sellQuantity = Bizim satın aldığımız adet
      // NOT: Satın alırken tax YOK, sadece bu fiyatı öderiz
      if (city.sellPrice && city.sellQuantity) {
        const cost = city.sellPrice * city.sellQuantity;
        totalCost += cost; // Satın alırken tax yok, direkt fiyat
        totalQuantity += city.sellQuantity;
      }
    }
  });
  
  // Kar = Gelir - Maliyet
  // Gelir: Black Market'ten aldığımız (tax yok)
  // Maliyet: Normal Market'ten ödediğimiz + buy order setup fee (varsa)
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
