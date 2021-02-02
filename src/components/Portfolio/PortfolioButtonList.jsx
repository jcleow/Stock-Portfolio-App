import React from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function PortfolioButtonList({ portfolioButtonsProps, setEquityChartData }) {
  const { portfolioList, setPortfolioStocks } = portfolioButtonsProps;
  const handleSelectPortfolio = (event) => {
    const portfolioId = event.target.value;
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        console.log(result.data, 'result-data');
        setPortfolioStocks(result.data.portfolioStocks);
        setEquityChartData(result.data.portfolioValueTimeSeries);
      })
      .then(() => {

      })
      .catch((error) => console.log(error));
  };

  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (<Button variant="primary" value={portfolioId} onClick={handleSelectPortfolio}>{portfolio.name}</Button>);
  });
  return (
    <div className="offset-display">
      {portfolioButtonList}
    </div>
  );
}
