import React from 'react';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Usuario Municipal">
      <Dashboard />
    </Layout>
  );
};

export default DashboardPage;
