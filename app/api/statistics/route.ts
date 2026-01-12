import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateTableStatistics } from '@/lib/calculations';

export async function GET() {
  try {
    // Get all tables
    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate statistics for all tables
    const allItems: any[] = [];
    const allProfits: Array<{ itemName: string; profit: number }> = [];

    tables?.forEach((table: any) => {
      if (table.data?.items) {
        table.data.items.forEach((item: any) => {
          allItems.push({
            ...item,
            isPremium: table.is_premium,
            orderType: table.order_type,
          });
        });
      }
    });

    // Calculate profit for each item across all tables
    allItems.forEach((item) => {
      const stats = calculateTableStatistics(
        [item],
        item.isPremium,
        item.orderType
      );
      if (stats.mostProfitableItems.length > 0) {
        allProfits.push(...stats.mostProfitableItems);
      }
    });

    // Aggregate statistics
    const mostSoldItems = allItems
      .reduce((acc: any, item: any) => {
        const existing = acc.find((a: any) => a.itemName === item.name);
        if (existing) {
          const totalQuantity = item.cities.reduce((sum: number, city: any) => {
            if (item.orderType === 'buy_order') {
              return sum + (city.buyQuantity || 0);
            } else {
              return sum + (city.sellQuantity || 0);
            }
          }, 0);
          existing.quantity += totalQuantity;
        } else {
          const totalQuantity = item.cities.reduce((sum: number, city: any) => {
            if (item.orderType === 'buy_order') {
              return sum + (city.buyQuantity || 0);
            } else {
              return sum + (city.sellQuantity || 0);
            }
          }, 0);
          acc.push({ itemName: item.name, quantity: totalQuantity });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    const mostProfitableItems = allProfits
      .reduce((acc: any, item: any) => {
        const existing = acc.find((a: any) => a.itemName === item.itemName);
        if (existing) {
          existing.profit += item.profit;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => b.profit - a.profit)
      .slice(0, 10);

    const leastProfitableItems = allProfits
      .reduce((acc: any, item: any) => {
        const existing = acc.find((a: any) => a.itemName === item.itemName);
        if (existing) {
          existing.profit += item.profit;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [])
      .sort((a: any, b: any) => a.profit - b.profit)
      .slice(0, 10);

    return NextResponse.json({
      mostSoldItems,
      mostProfitableItems,
      leastProfitableItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
