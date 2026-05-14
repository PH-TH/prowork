import { BookCheck, Hammer, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';

export function WeekendPlanCard() {
  const items = [
    { icon: BookCheck, title: 'Deep Learning', time: 'Sat 09:00-12:00', text: 'One skill, one concept, one note.' },
    { icon: Hammer, title: 'Build Project', time: 'Sat 14:00-16:00', text: 'Turn learning into a visible artifact.' },
    { icon: RotateCcw, title: 'Review', time: 'Sun 16:00-17:00', text: 'Flashcards, mistakes, weekly planning.' },
  ];

  return (
    <Card hover={false}>
      <p className="text-section-title">Weekend Plan</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-border bg-slate-50 p-4">
              <Icon className="text-primary" size={20} />
              <p className="mt-3 text-card-title">{item.title}</p>
              <p className="mt-1 font-inter text-[12px] font-semibold leading-4 text-primary">{item.time}</p>
              <p className="mt-2 text-caption-ui">{item.text}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
