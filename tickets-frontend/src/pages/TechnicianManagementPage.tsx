import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/layout/AdminLayout';
import TechnicianManagement from '../components/admin/TechnicianManagement';

const TechnicianManagementPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Gestion de Tecnicos — Sistema de Tickets</title></Helmet>
      <AdminLayout userName="Administrador Municipal">
        <TechnicianManagement />
      </AdminLayout>
    </>
  );
};

export default TechnicianManagementPage;
