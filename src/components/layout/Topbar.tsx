import { Bell, Moon, Search, Sun, UserCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/appStore';

export function Topbar() {
  const { searchQuery, setSearchQuery, themeMode, toggleThemeMode } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-border bg-app/85 px-6 backdrop-blur md:px-8">
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slateText" size={18} />
        <Input
          aria-label="Search ProWork"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search tasks, habits, sessions, journals..."
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={toggleThemeMode}
        >
          {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button variant="secondary" size="icon" aria-label="Notifications">
          <Bell size={18} />
        </Button>
        <Button variant="secondary" size="icon" aria-label="User profile">
          <UserCircle size={20} />
        </Button>
      </div>
    </header>
  );
}
