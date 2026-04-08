import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-switch"
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      <div className="theme-switch-track">
        <div className={`theme-switch-thumb ${theme}`}>
          <div className="theme-switch-icon">
            {theme === 'light' ? (
              <Sun size={16} className="sun-icon" />
            ) : (
              <Moon size={16} className="moon-icon" />
            )}
          </div>
        </div>
      </div>
      <span className="theme-switch-label">
        {theme === 'light' ? 'Claro' : 'Oscuro'}
      </span>
    </button>
  );
};

export default ThemeSwitch;
