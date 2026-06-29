import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Helmet } from 'react-helmet-async';
import BienesList from '../components/bienes/BienesList';

const BienesPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Consulta de Bienes — Sistema de Tickets</title></Helmet>
      <AdminLayout>
      <BienesList />
    </AdminLayout>
    </>
  );
};

export default BienesPage;
