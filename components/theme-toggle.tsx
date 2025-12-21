'use client';

import { useTheme } from '@/lib/theme-context';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <label className="theme-switch">
            <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
            />
            <span className="theme-slider"></span>
        </label>
    );
}
