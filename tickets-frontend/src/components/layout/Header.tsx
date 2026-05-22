import React, { useState, useEffect } from 'react';
import { Building, Clock, Globe } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import './Header.css';

interface HeaderProps {
  showUserInfo?: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showUserInfo = false, 
  userName = "Usuario Municipal" 
}) => {
  const [venezuelaTime, setVenezuelaTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const venezuelaOffset = -4; // UTC-4
      const venezuelaDate = new Date(utc + (venezuelaOffset * 3600000));
      
      // Update time
      setVenezuelaTime(venezuelaDate.toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }));
      
      // Update date
      setCurrentDate(venezuelaDate.toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-container">
      <div className="header-left">
        <img 
          src="/nombre_alcaldia_izquierda.png" 
          alt="Alcaldía San Cristóbal" 
          className="header-left-logo"
        />
      </div>
      
      <div className="header-right">
        <NotificationBell />
        <div className="compact-clock">
          <span className="time-text">{venezuelaTime}</span>
        </div>
        <img 
          src="/Logo SC Ciudad Ecologica.jpeg" 
          alt="Ciudad Ecológica" 
          className="header-right-logo"
        />
      </div>
    </header>
  );
};

export default Header;
