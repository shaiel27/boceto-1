import React from 'react';
import Layout from '../components/layout/Layout';
import TechnicianManagement from '../components/admin/TechnicianManagement';

const TechnicianManagementPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador Municipal">
      <TechnicianManagement />
    </Layout>
  );
};

export default TechnicianManagementPage;
