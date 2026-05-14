import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
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

export function DonutChart({ data, height = 260 }: DonutChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={4} animationDuration={850}>
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name) => [value, name]}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 60, outline: 'none' }}
            contentStyle={tooltipContentStyle}
            labelStyle={{ color: '#334155', fontWeight: 700 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
