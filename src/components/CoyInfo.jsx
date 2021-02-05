import React from 'react';

export default function CoyInfo({ coyInfo }) {
  const {
    companyName, close, change, changePercent, isUSMarketOpen,
  } = coyInfo;
  return (
    <div className="container">
      <h1>{companyName}</h1>
      <h2>{close}</h2>
      <h5>
        {change > 0 && '+' }
        {change}
      </h5>
      <h5>
        {changePercent > 0 && '+'}
        {(Number(changePercent) * 100).toFixed(2)}
        %
      </h5>
      <h6>{isUSMarketOpen ? 'Open' : 'Closed'}</h6>
    </div>
  );
}
