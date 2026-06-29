import React from 'react';
import { Helmet } from 'react-helmet-async';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Iniciar Sesion — Sistema de Tickets</title></Helmet>
      <LoginForm />
    </>
  );
};

export default LoginPage;
