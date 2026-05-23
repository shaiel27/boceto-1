import React from 'react';
import PublicHeader from '../components/public-board/PublicHeader';
import PublicBoard from '../components/public-board/PublicBoard';

const PublicBoardPage: React.FC = () => {
  return (
    <div className="public-board-page">
      <PublicHeader />
      <PublicBoard />
    </div>
  );
};

export default PublicBoardPage;
