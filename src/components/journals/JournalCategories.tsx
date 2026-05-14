import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';

export function JournalCategories() {
  const { categories } = useJournal();

  return (
    <Card hover={false}>
      <p className="text-section-title">Journal Categories</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Chip key={category} tone={category === 'Fix' ? 'red' : category === 'Manifest' ? 'purple' : 'green'}>{category}</Chip>
        ))}
      </div>
    </Card>
  );
}
