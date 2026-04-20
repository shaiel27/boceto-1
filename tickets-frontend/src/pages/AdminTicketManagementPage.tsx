import React from 'react';
import Layout from '../components/layout/Layout';
import AdminTicketManagement from '../components/admin/AdminTicketManagement';

const AdminTicketManagementPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <AdminTicketManagement />
    </Layout>
  );
};

export default AdminTicketManagementPage;
