import React from 'react';
import Layout from '../components/layout/Layout';
import OfficeManagement from '../components/admin/OfficeManagement';

const OfficeManagementPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <OfficeManagement />
    </Layout>
  );
};

export default OfficeManagementPage;
