import { Bar, BarChart as ReBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AppBarChartProps {
  data: Array<Record<string, number | string>>;
  xKey: string;
  barKey: string;
  color?: string;
  height?: number;
}

const tooltipContentStyle = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)',
  color: '#0F172A',
  fontFamily: 'Inter',
  fontSize: 12,
};

export function BarChart({ data, xKey, barKey, color = '#16A34A', height = 260 }: AppBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} />
          <Tooltip
            cursor={{ fill: '#F0FDF4' }}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 60, outline: 'none' }}
            contentStyle={tooltipContentStyle}
            labelStyle={{ color: '#334155', fontWeight: 700 }}
          />
          <Bar dataKey={barKey} radius={[10, 10, 0, 0]} fill={color} animationDuration={800} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
