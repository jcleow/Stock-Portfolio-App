import React from 'react';
import { FaCog } from 'react-icons/fa';

export default function EquityChartHeader({ equityChartHeaderProps }) {
  const {
    selectedPortfolioName,
    equityCurveData,
    accCostCurveData,
  } = equityChartHeaderProps;

  let arrOfPortfolioValues = [];
  let arrOfAccCostValues = [];
  let portfolioValue = 0;
  let portfolioCost = 0;
  let profitLoss = 0;
  let profitLossPct = 0;
  let formattedPnL = 0;

  if (equityCurveData && accCostCurveData) {
    arrOfPortfolioValues = Object.values(equityCurveData).map((val) => val);
    arrOfAccCostValues = Object.values(accCostCurveData).map((cost) => cost);
    portfolioValue = arrOfPortfolioValues.slice(-1)[0];
    portfolioCost = arrOfAccCostValues.slice(-1)[0];

    profitLoss = portfolioValue - portfolioCost;
    profitLossPct = ((profitLoss / arrOfAccCostValues.slice(-1)[0]) * 100).toFixed(2);
    formattedPnL = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profitLoss);
  }

  const formattedPV = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(portfolioValue);

  return (
    <div className="d-flex justify-content-between">
      <div className="offset-display mt-3">
        <h2>
          {selectedPortfolioName}
        </h2>
        {isNaN(portfolioValue) ? null : (
          <h1>
            {formattedPV}
          </h1>
        )}
        {isNaN(profitLoss)
          ? null : (
            <h5>
              P/L:
              {' '}
              {formattedPnL}
              {' '}
              (
              {profitLossPct}
              %)
            </h5>
          )}
      </div>
      <div className="mt-3 mr-3">
        <FaCog size={20} onClick={() => { console.log('test-3'); }} />
      </div>
    </div>
  );
}
