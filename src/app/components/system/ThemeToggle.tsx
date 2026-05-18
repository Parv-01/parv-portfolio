import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border-0 bg-transparent transition-colors duration-200"
      style={{
        color: 'var(--fg-muted)',
      }}
    >
      <span className="relative w-4 h-4 inline-block">
        <Sun
          size={16}
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(-90deg) scale(0.6)' : 'rotate(0) scale(1)',
          }}
        />
        <Moon
          size={16}
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.6)',
          }}
        />
      </span>
    </button>
  );
}
