import { Card } from '../ui/Card';

const data = [
  { name: 'Alex Kim', value: 80, avatar: 'AK', tone: 'bg-primary' },
  { name: 'Jane Smith', value: 65, avatar: 'JS', tone: 'bg-orange-400' },
  { name: 'Michael Lee', value: 45, avatar: 'ML', tone: 'bg-blue-400' },
  { name: 'Emily Park', value: 30, avatar: 'EP', tone: 'bg-purple-400' },
];

export function WorkloadByMember() {
  return (
    <Card hover={false} className="h-[218px] p-5">
      <p className="text-card-title">Workload by Member</p>
      <div className="mt-5 space-y-4">
        {data.map((member) => (
          <div key={member.name} className="grid grid-cols-[32px_92px_1fr_36px] items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-inter text-[10px] font-bold leading-4 text-white ${member.tone}`}>{member.avatar}</span>
            <span className="truncate text-chip-ui text-ink">{member.name}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${member.value}%` }} />
            </div>
            <span className="text-chip-ui text-ink">{member.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
