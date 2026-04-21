import React from 'react';
import Layout from '../components/layout/Layout';
import TechnicianDashboard from '../components/technician/TechnicianDashboard';

const TechnicianDashboardPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Técnico">
      <TechnicianDashboard />
    </Layout>
  );
};

export default TechnicianDashboardPage;
