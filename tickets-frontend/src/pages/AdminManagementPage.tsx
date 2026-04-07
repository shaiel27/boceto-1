import React from 'react';
import Layout from '../components/layout/Layout';
import AdminTicketManagement from '../components/admin/AdminTicketManagement';

const AdminManagementPage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Usuario Municipal">
      <AdminTicketManagement />
    </Layout>
  );
};

export default AdminManagementPage;
