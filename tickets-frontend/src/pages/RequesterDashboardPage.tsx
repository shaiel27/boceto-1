import React from 'react';
import Layout from '../components/layout/Layout';
import RequesterDashboard from '../components/requester/RequesterDashboard';

const RequesterDashboardPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Funcionario">
      <RequesterDashboard />
    </Layout>
  );
};

export default RequesterDashboardPage;
