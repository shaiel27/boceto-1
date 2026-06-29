import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/layout/AdminLayout';
import AdminTicketManagement from '../components/admin/AdminTicketManagement';

const AdminTicketManagementPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Gestion de Tickets — Sistema de Tickets</title></Helmet>
      <AdminLayout userName="Administrador">
        <AdminTicketManagement />
      </AdminLayout>
    </>
  );
};

export default AdminTicketManagementPage;
