import React from 'react';
import Header from '../components/layout/Header';
import PublicBoard from '../components/public-board/PublicBoard';

const PublicBoardPage: React.FC = () => {
  return (
    <div className="public-board-page">
      <Header showUserInfo={false} />
      <PublicBoard />
    </div>
  );
};

export default PublicBoardPage;
