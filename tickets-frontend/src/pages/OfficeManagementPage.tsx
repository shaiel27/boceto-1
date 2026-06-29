import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import OfficeManagement from '../components/admin/OfficeManagement';

const OfficeManagementPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Oficinas Municipales — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Administrador">
        <OfficeManagement />
      </Layout>
    </>
  );
};

export default OfficeManagementPage;
