import React from 'react';
import { Helmet } from 'react-helmet-async';
import PublicBoard from '../components/public-board/PublicBoard';

const PublicBoardPage: React.FC = () => {
  return (
    <>
      <Helmet><title>Tablero Publico — Sistema de Tickets</title></Helmet>
      <div className="public-board-page">
      <PublicBoard />
    </div>
    </>
  );
};

export default PublicBoardPage;
