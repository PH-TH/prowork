import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export function CircularProgress({ value, size = 96, stroke = 10, color = '#16A34A', label }: CircularProgressProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-data text-[20px] font-extrabold leading-6 tracking-[-0.03em] text-ink">{Math.round(value)}%</div>
        {label ? <div className="font-inter text-[11px] font-medium leading-4 text-slateText">{label}</div> : null}
      </div>
    </div>
  );
}
