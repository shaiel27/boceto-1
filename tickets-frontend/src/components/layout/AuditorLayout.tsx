import React from 'react';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface AuditorLayoutProps {
  children: React.ReactNode;
}

const AuditorLayout: React.FC<AuditorLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Header showUserInfo userName={user?.full_name || 'Auditor'} />
      <main className="main-content" style={{ marginLeft: 0 }}>
        <div className="page-container" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
          <div style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #1a202c)' }}>
            Auditoría del Sistema
          </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '6px',
                background: 'var(--surface-color, #fff)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-secondary, #4a5568)',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuditorLayout;
