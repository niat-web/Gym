import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card.js';
import { formatRupees } from '../../lib/formatters.js';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueSeriesItem {
  monthKey: string;
  label: string;
  revenueRupees: number;
  revenuePaise: number;
  orderCount: number;
}

interface RevenueChartProps {
  data: RevenueSeriesItem[];
  currentMonthPaise: number;
  growthPct: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [],
  currentMonthPaise,
  growthPct,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-charcoal-850 border border-charcoal-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          <p className="text-lime-400 font-extrabold text-sm">
            {formatRupees(item.revenuePaise)}
          </p>
          <p className="text-slate-400">{item.orderCount} membership orders</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-lime-400" />
            <CardTitle>Revenue Analytics (Last 6 Months)</CardTitle>
          </div>
          <p className="text-xs text-slate-400 mt-1">Monthly collection from successful plan payments</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-lime-400">{formatRupees(currentMonthPaise)}</p>
          <p className="text-[11px] font-semibold text-emerald-400">
            {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`} vs last month
          </p>
        </div>
      </CardHeader>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#525D7E"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#525D7E"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenueRupees"
              stroke="#CCFF00"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
