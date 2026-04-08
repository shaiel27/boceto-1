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
        <div className="header-logo">
          <Building size={20} color="white" />
        </div>
        <div className="header-title">
          <h1 className="header-main-title">Alcaldía del Municipio</h1>
          <h2 className="header-subtitle">San Cristóbal - Panel de Control Administrativo</h2>
        </div>
      </div>
      
      {showUserInfo && (
        <div className="header-right">
          <ThemeSwitch />
          <div className="user-info">
            <div className="user-avatar">
              <User size={16} color="white" />
            </div>
            <span className="user-name">{userName}</span>
            <ChevronDown className="dropdown-arrow" size={16} color="white" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
