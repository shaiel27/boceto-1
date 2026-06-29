import React from 'react';
import AuditorLayout from '../components/layout/AuditorLayout';
import { Helmet } from 'react-helmet-async';
import AuditLog from '../components/admin/AuditLog';

const AuditPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Auditoria del Sistema — Sistema de Tickets</title></Helmet>
      <AuditorLayout>
      <AuditLog />
    </AuditorLayout>
    </>
  );
};

export default AuditPage;