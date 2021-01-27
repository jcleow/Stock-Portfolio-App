import React from 'react';

export default function StockKeyStats({ keyStats }) {
  const {
    marketcap,
    week52high,
    week52low,
    sharesOutstanding,
    ttmEPS,
    dividendYield,
    peRatio,
    beta,
  } = keyStats;

  const marketCapDisplay = new Intl.NumberFormat()
    .format(Number((marketcap / (10 ** 6)).toFixed(0)));

  const sharesOutstandingDisplay = new Intl.NumberFormat()
    .format(Number((sharesOutstanding / (10 ** 6)).toFixed(0)));

  const dividendYieldDisplay = (dividendYield * 100).toFixed(2);

  const arrayOfStats = [
    [{ 'Market Cap ($M)': marketCapDisplay }, { Beta: beta.toFixed(2) }],
    [{ '52 Week High': week52high }, { '52 Week Low': week52low }],
    [{ 'Shares Outstanding (M)': sharesOutstandingDisplay }, { 'EPS (TTM)': ttmEPS }],
    [{ 'Dividend Yield': dividendYieldDisplay }, { 'PE Ratio': peRatio.toFixed(2) }],
  ];

  const keyStatsDisplay = arrayOfStats.map((row) => {
    const rowDisplay = row.map((stat) => (
      <div className="col d-flex justify-content-between">
        <div>
          {Object.keys(stat)}
        </div>
        <div>
          <b>
            {Object.values(stat)}
          </b>
        </div>
      </div>
    ));
    return (
      <div className="row">
        {rowDisplay}
      </div>
    );
  });

  return (
    <div className="container mt-5">
      {keyStatsDisplay}
    </div>

  );
}
