import { motion } from 'framer-motion';
import { Quote, Sprout } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { Card } from '../ui/Card';

export function AiEncouragementCard() {
  const { encouragement } = useDashboard();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Card className="relative overflow-hidden border-primary-soft bg-primary-pale">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-soft bg-white px-3 py-1 text-chip-ui text-primary">
              <Sprout size={15} />
              กำลังใจจาก AI วันนี้
            </div>
            <p className="max-w-3xl font-kanit text-[20px] font-normal leading-[32px] text-ink">{encouragement.body}</p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary-soft bg-white/80 p-4">
              <Quote className="mt-1 text-primary" size={18} />
              <p className="font-kanit text-[14px] leading-[22px] text-slateText">{encouragement.quote === 'Small, clear starts beat dramatic promises.' ? 'การเริ่มต้นเล็ก ๆ ที่ชัดเจน ดีกว่าคำสัญญาใหญ่ที่ไม่ลงมือทำ' : encouragement.quote}</p>
            </div>
          </div>
          <div className="mx-auto flex h-48 w-48 items-end justify-center rounded-[32px] border border-primary-soft bg-white">
            <div className="relative h-36 w-28">
              <div className="absolute bottom-0 left-1/2 h-20 w-16 -translate-x-1/2 rounded-t-[28px] border border-primary-soft bg-primary-pale" />
              <div className="absolute bottom-20 left-1/2 h-24 w-1 -translate-x-1/2 rounded-full bg-primary" />
              <div className="absolute bottom-28 left-4 h-12 w-16 rotate-[-28deg] rounded-[100%_0] bg-primary-soft" />
              <div className="absolute bottom-20 right-2 h-12 w-16 rotate-[28deg] rounded-[0_100%] bg-primary" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
