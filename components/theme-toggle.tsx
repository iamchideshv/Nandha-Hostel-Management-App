'use client';

import { useTheme } from '@/lib/theme-context';
import { Haptics } from '@/lib/haptics';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const handleToggle = () => {
        Haptics.light();
        toggleTheme();
    };

    return (
        <label className="theme-switch">
            <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={handleToggle}
            />
            <span className="theme-slider"></span>
        </label>
    );
}
