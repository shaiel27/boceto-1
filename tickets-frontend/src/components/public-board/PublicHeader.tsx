import React from 'react';
import './PublicHeader.css';

const PublicHeader: React.FC = () => {
  return (
    <header className="ph-header">
      <div className="ph-header-left">
        <div className="ph-color-bar" />
        <span className="ph-brand">ALCALDÍA DE SAN CRISTÓBAL</span>
        <span className="ph-divider" />
        <span className="ph-module">Sistema de Gestión de Tickets</span>
      </div>
      <div className="ph-header-right">
        <span className="ph-tag">DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA</span>
      </div>
    </header>
  );
};

export default PublicHeader;
