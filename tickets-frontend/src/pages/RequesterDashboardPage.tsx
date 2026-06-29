import React from 'react';
import Layout from '../components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import RequesterDashboard from '../components/requester/RequesterDashboard';

const RequesterDashboardPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Mis Solicitudes — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Funcionario">
      <RequesterDashboard />
    </Layout>
    </>
  );
};

export default RequesterDashboardPage;
