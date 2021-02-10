import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import PriceChart from './PriceChart.jsx';
import CoyInfo from './CoyInfo.jsx';
import SymbolLookup from './SymbolLookup.jsx';
import StockKeyStats from './StockKeyStats.jsx';

export default function StockSearch({ stockSearchProps }) {
  // Track the price quote data for the price chart
  const {
    quoteData,
    duration,
    keyStats,
    coyInfo,
    loadingCoyInfo,
    loadingChart,
    loadingKeyStats,
    handleGetChart,
    symbolInput,
    setSymbolInput,
  } = stockSearchProps;

  function ToggleMonthPriceButton() {
    const chartTimeFrames = ['1m', '3m', '6m'];
    const listOfButtons = chartTimeFrames.map((timeFrame) => (
      <div className="timeframe-option" key={timeFrame}>
        <Button variant="outline-dark" type="submit" onClick={() => { handleGetChart(timeFrame, symbolInput, false); }}>
          {timeFrame}
        </Button>
      </div>
    ));
    return listOfButtons;
  }
  // All props to be sent into the various components
  const symbolLookUpProps = {
    symbolInput, setSymbolInput, handleGetChart,
  };
  const priceChartProps = { quoteData, duration };

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col d-flex justify-content-between">
          {loadingCoyInfo
            ? <img alt="loading..." src="/spinner.gif" />
            : <CoyInfo coyInfo={coyInfo} />}
        </div>
        <div className="col d-flex flex-column align-items-end">
          <div className="row">
            <div className="col">
              <SymbolLookup symbolLookUpProps={symbolLookUpProps} />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col d-flex justify-content-between">
              <ToggleMonthPriceButton />
            </div>
          </div>
        </div>
      </div>
      {loadingChart
        ? <img alt="loading..." src="/spinner.gif" />
        : <PriceChart priceChartProps={priceChartProps} />}
      {loadingKeyStats
        ? <img alt="loading..." src="/spinner.gif" />
        : <StockKeyStats keyStats={keyStats} />}
    </div>
  );
}
