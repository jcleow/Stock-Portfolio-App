import React from 'react';

export default function CoyInfo({ coyInfo }) {
  const {
    companyName, latestPrice, change, changePercent, isUSMarketOpen,
  } = coyInfo;
  console.log(coyInfo, 'coyInfo');
  return (
    <div className="container">
      <h1>{companyName}</h1>
      <h2>{latestPrice}</h2>
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
