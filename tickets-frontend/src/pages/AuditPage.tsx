import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import AuditLog from '../components/admin/AuditLog';

const AuditPage: React.FC = () => {
  return (
    <AdminLayout userName="Administrador Municipal">
      <AuditLog />
    </AdminLayout>
  );
};

export default AuditPage;