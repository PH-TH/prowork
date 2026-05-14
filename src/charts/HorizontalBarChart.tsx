import { Bar, BarChart as ReBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HorizontalBarChartProps {
  data: Array<Record<string, number | string>>;
  yKey: string;
  barKey: string;
  color?: string;
  height?: number;
}

export function HorizontalBarChart({ data, yKey, barKey, color = '#3B82F6', height = 260 }: HorizontalBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 20, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} />
          <YAxis type="category" dataKey={yKey} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} width={90} />
          <Tooltip cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey={barKey} radius={[0, 10, 10, 0]} fill={color} animationDuration={800} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
