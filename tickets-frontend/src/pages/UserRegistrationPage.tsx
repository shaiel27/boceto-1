import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import UserRegistration from '../components/admin/UserRegistration';

const UserRegistrationPage = () => {
  return (
    <>
      <Helmet><title>Registro de Usuario — Sistema de Tickets</title></Helmet>
      <Layout showHeader={true} showUserInfo={true} userName="Administrador">
        <UserRegistration />
      </Layout>
    </>
  );
};

export default UserRegistrationPage;
