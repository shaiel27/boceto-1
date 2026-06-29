import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModernAdminDashboard from '../components/admin/ModernAdminDashboard';

const AdminManagementPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Panel de Administracion — Sistema de Tickets</title></Helmet>
      <ModernAdminDashboard />
    </>
  );
};

export default AdminManagementPage;
