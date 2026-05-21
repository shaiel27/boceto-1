import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AdminTicketManagement from '../components/admin/AdminTicketManagement';

const AdminTicketManagementPage: React.FC = () => {
  return (
    <AdminLayout userName="Administrador">
      <AdminTicketManagement />
    </AdminLayout>
  );
};

export default AdminTicketManagementPage;
