import React from 'react';
import Layout from '../components/layout/Layout';
import ModernAdminDashboard from '../components/admin/ModernAdminDashboard';

const ModernAdminDashboardPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <ModernAdminDashboard />
    </Layout>
  );
};

export default ModernAdminDashboardPage;
