import React from 'react';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showUserInfo?: boolean;
  userName?: string;
  isLogin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showUserInfo = false,
  userName = "Usuario Municipal",
  isLogin = false
}) => {
  if (isLogin) {
    return (
      <div className="login-layout">
        {showHeader && <Header showUserInfo={showUserInfo} userName={userName} />}
        <main className="login-content">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {showHeader && <Header showUserInfo={showUserInfo} userName={userName} />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
