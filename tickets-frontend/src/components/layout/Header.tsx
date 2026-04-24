import React, { useState, useEffect } from 'react';
import { Building, User, ChevronDown, Clock } from 'lucide-react';
import ThemeSwitch from '../ui/ThemeSwitch';
import '../ui/ThemeSwitch.css';
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const venezuelaOffset = -4; // UTC-4
      const venezuelaDate = new Date(utc + (venezuelaOffset * 3600000));
      setVenezuelaTime(venezuelaDate.toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
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
        {showUserInfo && (
          <>
            <div className="venezuela-clock">
              <Clock size={16} color="white" />
              <span className="clock-time">{venezuelaTime}</span>
              <span className="clock-label">Venezuela</span>
            </div>
            <ThemeSwitch />
            <div className="user-info">
              <div className="user-avatar">
                <User size={16} color="white" />
              </div>
              <span className="user-name">{userName}</span>
              <ChevronDown className="dropdown-arrow" size={16} color="white" />
            </div>
          </>
        )}
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
