import React from 'react';
import AuditorLayout from '../components/layout/AuditorLayout';
import AuditLog from '../components/admin/AuditLog';

const AuditPage: React.FC = () => {
  return (
    <AuditorLayout>
      <AuditLog />
    </AuditorLayout>
  );
};

export default AuditPage;