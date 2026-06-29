import React from 'react';
import Layout from '../components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import TechnicianDashboard from '../components/technician/TechnicianDashboard';

const TechnicianDashboardPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Panel de Tecnico — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Técnico">
      <TechnicianDashboard />
    </Layout>
    </>
  );
};

export default TechnicianDashboardPage;
