import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import Reports from '../components/dashboard/Reports';

const ReportsPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Reportes Ejecutivos — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Administrador">
        <Reports />
      </Layout>
    </>
  );
};

export default ReportsPage;
