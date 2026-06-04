import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import BienesList from '../components/bienes/BienesList';

const BienesPage: React.FC = () => {
  return (
    <AdminLayout>
      <BienesList />
    </AdminLayout>
  );
};

export default BienesPage;
