import React, { useState, useEffect } from 'react';
import { Building, Clock, Globe, LogOut, User } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const venezuelaOffset = -4;
      const venezuelaDate = new Date(utc + (venezuelaOffset * 3600000));
      
      setVenezuelaTime(venezuelaDate.toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }));
      
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
          <div className="user-info" title={userName}>
            <div className="user-avatar">
              <User size={16} color="white" />
            </div>
            <span className="user-name">{userName}</span>
          </div>
        )}
        <NotificationBell />
        <div className="compact-clock">
          <span className="time-text">{venezuelaTime}</span>
        </div>
        {showUserInfo && (
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'white',
              transition: 'all 0.2s'
            }}
            title="Cerrar sesión"
          >
            <LogOut size={14} />
            Salir
          </button>
        )}
        <img 
          src="/SC-Ciudad-Ecológica-Derecha.png" 
          alt="Ciudad Ecológica" 
          className="header-right-logo"
        />
      </div>
    </header>
  );
};

export default Header;
