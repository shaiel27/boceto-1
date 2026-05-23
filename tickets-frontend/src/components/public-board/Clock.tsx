import React, { useEffect, useState } from 'react';
import './Clock.css';

const Clock: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const opts: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Caracas',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timeStr = now.toLocaleTimeString('es-VE', opts);
  const dateStr = now.toLocaleDateString('es-VE', dateOpts);

  const [h, m, s] = timeStr.split(':');

  return (
    <div className="pb-clock">
      <div className="pb-clock-digits">
        <span className="pb-clock-h">{h}</span>
        <span className="pb-clock-sep">:</span>
        <span className="pb-clock-m">{m}</span>
        <span className="pb-clock-sep">:</span>
        <span className="pb-clock-s">{s}</span>
      </div>
      <div className="pb-clock-date">{dateStr}</div>
    </div>
  );
};

export default Clock;
