import React from 'react';
import { Helmet } from 'react-helmet-async';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Registro — Sistema de Tickets</title></Helmet>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
