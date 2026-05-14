import { Download, KeyRound, Palette, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { useAppStore } from '../stores/appStore';

export function SettingsPage() {
  const [theme, setTheme] = useState('Light');
  const [accentColor, setAccentColor] = useState('#16A34A');
  const [defaultModule, setDefaultModule] = useState('Dashboard');
  const [encouragement, setEncouragement] = useState(true);
  const [financeLock, setFinanceLock] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [habitReminder, setHabitReminder] = useState('08:00');
  const [journalReminder, setJournalReminder] = useState('21:30');
  const [motivationTone, setMotivationTone] = useState('Calm discipline');
  const [lastBackup, setLastBackup] = useState('Not exported yet');
  const addToast = useAppStore((state) => state.addToast);

  const settingsPreview = useMemo(() => ({
    theme,
    accentColor,
    defaultModule,
    encouragement,
    financeLock,
    notifications,
    habitReminder,
    journalReminder,
    motivationTone,
  }), [accentColor, defaultModule, encouragement, financeLock, habitReminder, journalReminder, motivationTone, notifications, theme]);

  const saveSettings = () => {
    addToast({ title: 'Saved successfully', description: `${theme} theme, ${defaultModule} default module, reminders updated.` });
  };

  const exportMockData = () => {
    setLastBackup(new Date().toLocaleString('en-US'));
    addToast({ title: 'Export prepared', description: 'Mock settings snapshot is ready for a future backend export.' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Personalize appearance, privacy, reminders, backup, and AI motivation."
        actions={<Button onClick={saveSettings}>Save Settings</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsSection icon={<Palette size={20} />} title="Appearance">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Theme" options={['Light', 'Dark']} value={theme} onChange={(event) => setTheme(event.target.value)} />
            <Input label="Accent Color" type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-11 p-1" />
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-card-title">Preview</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: accentColor }} />
              <p className="text-body-ui text-slateText">{theme} theme with {accentColor} accent.</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection icon={<ShieldCheck size={20} />} title="Personal Preferences">
          <Toggle checked={encouragement} onChange={setEncouragement} label="Daily AI Encouragement" />
          <div className="mt-4">
            <Select label="Default Focus Module" options={['Dashboard', 'Habit', 'Learning', 'Finance', 'Journals']} value={defaultModule} onChange={(event) => setDefaultModule(event.target.value)} />
          </div>
        </SettingsSection>

        <SettingsSection icon={<KeyRound size={20} />} title="Security">
          <Toggle checked={financeLock} onChange={setFinanceLock} label="Finance Lock enabled" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Finance Lock password" type="password" placeholder="****" />
            <Badge tone={financeLock ? 'green' : 'gray'}>{financeLock ? 'Finance Lock active' : 'Finance Lock off'}</Badge>
          </div>
        </SettingsSection>

        <SettingsSection icon={<Download size={20} />} title="Data Backup">
          <p className="text-body-ui text-slateText">Export mock data now. Later this can call Supabase storage or a secure backup job.</p>
          <p className="mt-2 text-caption-ui">Last backup: {lastBackup}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportMockData}>Backup Mock Data</Button>
            <Button variant="outline" onClick={exportMockData}>Export JSON</Button>
          </div>
        </SettingsSection>

        <SettingsSection title="Notification Settings">
          <Toggle checked={notifications} onChange={setNotifications} label="Enable reminders" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Habit reminder time" type="time" value={habitReminder} onChange={(event) => setHabitReminder(event.target.value)} />
            <Input label="Journal reminder time" type="time" value={journalReminder} onChange={(event) => setJournalReminder(event.target.value)} />
          </div>
        </SettingsSection>

        <SettingsSection title="AI Motivation Settings">
          <Select label="Motivation tone" options={['Calm discipline', 'Direct accountability', 'Gentle encouragement']} value={motivationTone} onChange={(event) => setMotivationTone(event.target.value)} />
          <div className="mt-4">
            <Toggle checked={encouragement} onChange={setEncouragement} label="Rotate famous quote style" />
          </div>
        </SettingsSection>
      </div>

      <Card hover={false}>
        <p className="text-section-title">Current Settings Snapshot</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(settingsPreview).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-border bg-slate-50 p-3">
              <p className="text-caption-ui capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              {typeof value === 'boolean' ? (
                <div className="mt-2">
                  <Badge tone={value ? 'green' : 'gray'}>{value ? 'Enabled' : 'Disabled'}</Badge>
                </div>
              ) : (
                <p className="mt-1 text-body-ui text-ink">{String(value)}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Card hover={false}>
      <div className="mb-5 flex items-center gap-3">
        {icon ? <div className="rounded-2xl bg-primary-pale p-3 text-primary">{icon}</div> : null}
        <h2 className="text-section-title">{title}</h2>
      </div>
      {children}
    </Card>
  );
}
