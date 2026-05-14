import { Line, LineChart as ReLineChart, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: Array<Record<string, number | string>>;
  dataKey: string;
  color?: string;
}

export function SparklineChart({ data, dataKey, color = '#16A34A' }: SparklineChartProps) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <Line dataKey={dataKey} type="monotone" stroke={color} strokeWidth={3} dot={false} animationDuration={700} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
