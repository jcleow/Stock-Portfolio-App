import React from 'react';
import { Button } from 'react-bootstrap';

export default function PortfolioButtonList({ portfolioButtonsProps, refreshPortfolioView }) {
  const { portfolioList } = portfolioButtonsProps;
  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (<Button variant="outline-dark" value={portfolioId} onClick={refreshPortfolioView}>{portfolio.name}</Button>);
  });
  return (
    <div className="offset-display">
      {portfolioButtonList}
    </div>
  );
}
