import React from 'react';

export default function CoyInfo({ coyInfo }) {
  const {
    companyName, close, change, changePercent, isUSMarketOpen,
  } = coyInfo;
  const formattedClose = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(close);

  const formattedChange = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(change);

  return (
    <div className="container">
      <h6 className="light-grey-font">{companyName}</h6>
      <h1>{formattedClose}</h1>
      <h6 className="purple-font mt-3">
        {change > 0 && '+' }
        {formattedChange}
        {changePercent > 0 && '+'}
        (
        {(Number(changePercent) * 100).toFixed(2)}
        %)
      </h6>
      <h6>{isUSMarketOpen ? 'Open' : 'Closed'}</h6>
    </div>
  );
}
