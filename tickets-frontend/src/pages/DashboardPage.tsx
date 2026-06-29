import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Dashboard — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Usuario Municipal">
      <Dashboard />
    </Layout>
    </>
  );
};

export default DashboardPage;
