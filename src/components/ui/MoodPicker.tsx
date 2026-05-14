import type { Mood } from '../../types/journal';
import { MOODS } from '../../lib/constants';
import { moodColors } from '../../data/mockJournal';
import { cn } from '../../lib/utils';

interface MoodPickerProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood}
          type="button"
          onClick={() => onChange(mood)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-chip-ui transition hover:-translate-y-0.5',
            value === mood ? 'border-transparent text-white shadow-sm' : 'border-border bg-white text-slateText hover:border-primary-soft',
          )}
          style={value === mood ? { backgroundColor: moodColors[mood] } : undefined}
        >
          {mood}
        </button>
      ))}
    </div>
  );
}
