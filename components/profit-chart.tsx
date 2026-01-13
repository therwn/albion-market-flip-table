'use client';

import { ProfitCalculation } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ProfitChartProps {
  calculations: ProfitCalculation[];
}

export function ProfitChart({ calculations }: ProfitChartProps) {
  const data = calculations.map((calc) => ({
    name: calc.itemName || 'İsimsiz',
    kar: calc.profit > 0 ? calc.profit : 0,
    zarar: calc.profit < 0 ? Math.abs(calc.profit) : 0,
    profit: calc.profit,
  }));

  const colors = {
    kar: '#22c55e',
    zarar: '#ef4444',
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => {
            const numValue = value ?? 0;
            const nameStr = name ?? '';
            if (nameStr === 'kar') return [`${numValue.toLocaleString('tr-TR')}`, 'Kar'];
            if (nameStr === 'zarar') return [`${numValue.toLocaleString('tr-TR')}`, 'Zarar'];
            return [`${numValue.toLocaleString('tr-TR')}`, 'Net'];
          }}
        />
        <Legend />
        <Bar dataKey="kar" fill={colors.kar} name="Kar" />
        <Bar dataKey="zarar" fill={colors.zarar} name="Zarar" />
      </BarChart>
    </ResponsiveContainer>
  );
}
