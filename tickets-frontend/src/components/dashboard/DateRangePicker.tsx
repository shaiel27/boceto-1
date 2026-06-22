import React, { useState, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

const PRESETS: { label: string; days: number }[] = [
  { label: '7 dias', days: 7 },
  { label: '15 dias', days: 15 },
  { label: '30 dias', days: 30 },
  { label: '60 dias', days: 60 },
  { label: '90 dias', days: 90 },
  { label: 'Todo', days: 0 },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);

  const activePreset = PRESETS.find((p) => {
    if (p.days === 0) return false;
    return startDate === daysAgo(p.days) && endDate === formatDate(new Date());
  });

  const handlePreset = useCallback((days: number) => {
    setShowCustom(false);
    if (days === 0) {
      onChange('1970-01-01', formatDate(new Date()));
    } else {
      onChange(daysAgo(days), formatDate(new Date()));
    }
  }, [onChange]);

  return (
    <div className="daterange-picker">
      <div className="daterange-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={`daterange-preset-btn ${(activePreset?.label === p.label || (p.days === 0 && !activePreset && startDate === '1970-01-01')) ? 'active' : ''}`}
            onClick={() => handlePreset(p.days)}
          >
            {p.label}
          </button>
        ))}
        <button
          className={`daterange-preset-btn daterange-custom-btn ${showCustom ? 'active' : ''}`}
          onClick={() => setShowCustom(!showCustom)}
        >
          <Calendar size={14} />
          Personalizado
          <ChevronDown size={12} className={`daterange-chevron ${showCustom ? 'open' : ''}`} />
        </button>
      </div>
      {showCustom && (
        <div className="daterange-custom">
          <div className="daterange-custom-field">
            <label>Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChange(e.target.value, endDate)}
              max={endDate}
            />
          </div>
          <span className="daterange-separator">—</span>
          <div className="daterange-custom-field">
            <label>Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChange(startDate, e.target.value)}
              min={startDate}
              max={formatDate(new Date())}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
export { formatDate, daysAgo };
