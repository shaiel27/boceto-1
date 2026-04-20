import React from 'react';
import { Building, User, ChevronDown } from 'lucide-react';
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
          src="/SC-Ciudad-Ecológica-Derecha.png" 
          alt="Ciudad Ecológica" 
          className="header-right-logo"
        />
      </div>
    </header>
  );
};

export default Header;
