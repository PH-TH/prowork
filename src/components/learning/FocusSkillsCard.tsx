import { useLearning } from '../../hooks/useLearning';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface FocusSkillsCardProps {
  skillFilter?: string;
}

export function FocusSkillsCard({ skillFilter = 'All Skills' }: FocusSkillsCardProps) {
  const { skills } = useLearning();
  const visibleSkills = skillFilter === 'All Skills' ? skills : skills.filter((skill) => skill.name === skillFilter);

  return (
    <Card hover={false}>
      <p className="text-section-title">Focus Skills</p>
      <div className="mt-5 space-y-4">
        {visibleSkills.map((skill) => (
          <div key={skill.id}>
            <div className="mb-2 flex justify-between gap-2">
              <span className="text-body-ui text-ink">{skill.name}</span>
              <span className="font-inter text-[14px] font-medium leading-5 text-slateText">{skill.progress}%</span>
            </div>
            <ProgressBar value={skill.progress} color={skill.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}
