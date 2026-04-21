import React from 'react';
import Layout from '../components/layout/Layout';
import UserRegistration from '../components/admin/UserRegistration';

const UserRegistrationPage = () => {
  return (
    <Layout showHeader={true} showUserInfo={true} userName="Administrador">
      <UserRegistration />
    </Layout>
  );
};

export default UserRegistrationPage;
