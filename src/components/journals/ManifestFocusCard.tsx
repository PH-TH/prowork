import { Sparkles } from 'lucide-react';
import { useJournal } from '../../hooks/useJournal';
import { Card } from '../ui/Card';

export function ManifestFocusCard() {
  const { todayEntry } = useJournal();

  return (
    <Card hover={false} className="border-purple-100 bg-purple-50">
      <div className="flex gap-3">
        <div className="rounded-2xl bg-white p-3 text-purple-600"><Sparkles size={20} /></div>
        <div>
          <p className="text-section-title">Manifest Focus</p>
          <p className="mt-2 text-body-th text-slateText">{todayEntry?.manifestFocus ?? 'A calm, wealthy, healthy life built by small promises.'}</p>
        </div>
      </div>
    </Card>
  );
}
