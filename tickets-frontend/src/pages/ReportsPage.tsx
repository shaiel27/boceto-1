import React from 'react';
import Layout from '../components/layout/Layout';
import Reports from '../components/dashboard/Reports';

const ReportsPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <Reports />
    </Layout>
  );
};

export default ReportsPage;
