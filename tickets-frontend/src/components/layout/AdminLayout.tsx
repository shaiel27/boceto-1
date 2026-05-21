import React from 'react';
import Header from './Header';
import ModernSidebar from './ModernSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  userName = 'Administrador',
}) => {
  return (
    <div className="app-layout">
      <Header showUserInfo userName={userName} />
      <ModernSidebar />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
