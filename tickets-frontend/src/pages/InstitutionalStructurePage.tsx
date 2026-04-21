import React from 'react';
import Layout from '../components/layout/Layout';
import InstitutionalStructure from '../components/admin/InstitutionalStructure';

const InstitutionalStructurePage: React.FC = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <InstitutionalStructure />
    </Layout>
  );
};

export default InstitutionalStructurePage;
