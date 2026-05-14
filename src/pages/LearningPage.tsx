import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddLearningSessionModal } from '../components/learning/AddLearningSessionModal';
import { FocusSkillsCard } from '../components/learning/FocusSkillsCard';
import { LearningCalendar } from '../components/learning/LearningCalendar';
import { LearningHeaderCards } from '../components/learning/LearningHeaderCards';
import { LearningPrinciplesCard } from '../components/learning/LearningPrinciplesCard';
import { WeekendPlanCard } from '../components/learning/WeekendPlanCard';
import { WeeklyTemplateCard } from '../components/learning/WeeklyTemplateCard';
import { PageHeader } from '../components/layout/PageHeader';
import { RightPanel } from '../components/layout/RightPanel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { useLearning } from '../hooks/useLearning';

export function LearningPage() {
  const [open, setOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const { activeMonth, setActiveMonth, monthlyPlans, sessions, skills } = useLearning();

  const recentSessions = sessions.slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Monthly Learning Plan"
        subtitle="Plan study time around work shift and trading without burnout."
        actions={
          <>
            <Select
              aria-label="Month selector"
              value={activeMonth}
              onChange={(event) => setActiveMonth(event.target.value as typeof activeMonth)}
              options={monthlyPlans.map((plan) => plan.month)}
              className="w-[170px]"
            />
            <Select
              aria-label="Skill filter"
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
              options={['All Skills', ...skills.map((skill) => skill.name)]}
              className="w-[190px]"
            />
            <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>Add Session</Button>
          </>
        }
      />
      <LearningHeaderCards />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <LearningCalendar skillFilter={skillFilter} />
        <RightPanel>
          <WeeklyTemplateCard />
          <LearningPrinciplesCard />
        </RightPanel>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <FocusSkillsCard skillFilter={skillFilter} />
        <WeekendPlanCard />
      </div>
      <Card hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-section-title">Recent Learning Sessions</p>
            <p className="text-page-subtitle">New sessions saved from the modal appear here and on the calendar.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)} icon={<Plus size={15} />}>Log</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recentSessions.map((session) => {
            const skill = skills.find((item) => item.id === session.skillId);
            return (
              <div key={session.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-card-title">{skill?.name ?? 'Learning'}</p>
                    <p className="mt-1 text-caption-ui">{session.date} - {session.startTime}-{session.endTime}</p>
                  </div>
                  <span className="rounded-full border border-primary-soft bg-primary-pale px-2.5 py-1 font-inter text-[12px] font-semibold text-primary">{session.outputType}</span>
                </div>
                <p className="mt-3 text-body-ui text-slateText">{session.remark || `${session.sessionType} session with ${session.focusScore}/10 focus.`}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <AddLearningSessionModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
