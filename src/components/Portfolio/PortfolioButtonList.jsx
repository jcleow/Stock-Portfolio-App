import React from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function PortfolioButtonList({ portfolioButtonsProps, refreshPortfolioView }) {
  const { portfolioList, setPortfolioStocks } = portfolioButtonsProps;
  console.log(portfolioList, 'portfolioList');
  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (<Button variant="primary" value={portfolioId} onClick={refreshPortfolioView}>{portfolio.name}</Button>);
  });
  return (
    <div className="offset-display">
      {portfolioButtonList}
    </div>
  );
}
