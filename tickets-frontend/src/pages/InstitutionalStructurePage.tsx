import React from 'react';
import { Helmet } from 'react-helmet-async';
import InstitutionalStructure from '../components/admin/InstitutionalStructure';

const InstitutionalStructurePage: React.FC = () => {
  return <><Helmet><title>Estructura Institucional — Sistema de Tickets</title></Helmet><InstitutionalStructure /></>;
};

export default InstitutionalStructurePage;
