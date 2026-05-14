import { CartesianGrid, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AppLineChartProps {
  data: Array<Record<string, number | string>>;
  lines: Array<{ key: string; color: string; name?: string }>;
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

export function LineChart({ data, lines, height = 260 }: AppLineChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Inter', fontWeight: 500 }} />
          <Tooltip
            cursor={{ stroke: '#16A34A', strokeWidth: 1, strokeDasharray: '4 4' }}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 60, outline: 'none' }}
            contentStyle={tooltipContentStyle}
            labelStyle={{ color: '#334155', fontWeight: 700 }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name ?? line.key}
              stroke={line.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={900}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
