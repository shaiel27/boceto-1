import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import TechnicianManagement from '../components/admin/TechnicianManagement';

const TechnicianManagementPage: React.FC = () => {
  return (
    <AdminLayout userName="Administrador Municipal">
      <TechnicianManagement />
    </AdminLayout>
  );
};

export default TechnicianManagementPage;
