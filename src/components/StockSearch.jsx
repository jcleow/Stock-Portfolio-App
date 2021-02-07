import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import PriceChart from './PriceChart.jsx';
import CoyInfo from './CoyInfo.jsx';
import SymbolLookup from './SymbolLookup.jsx';
import StockKeyStats from './StockKeyStats.jsx';

export default function StockSearch({ stockSearchProps }) {
  const [symbolInput, setSymbolInput] = useState('');
  // Track the price quote data for the price chart
  const {
    quoteData,
    duration,
    keyStats,
    symbol,
    coyInfo,
    loadingCoyInfo,
    loadingChart,
    loadingKeyStats,
    setQuoteData,
    setDuration,
    setKeyStats,
    setSymbol,
    setCoyInfo,
    setLoadingCoyInfo,
    setLoadingChart,
    setLoadingKeyStats,

  } = stockSearchProps;

  function handleGetChart(timeFrame) {
    let coyInfoData;
    setLoadingCoyInfo(true);
    setLoadingChart(true);
    setLoadingKeyStats(true);
    let selectedSymbol = symbolInput;
    if (!symbolInput) {
      selectedSymbol = symbol;
    }

    axios.get(`/${selectedSymbol}/headlineInfo`)
      .then((result) => {
        console.log(result.data.symbol, 'result symbol');
        setSymbol(result.data.symbol);
        coyInfoData = result.data;
        return axios.get(`/${symbol}/chart/${timeFrame}`);
      })
      .then((chartDataResult) => {
        // Due to IEX inconsistent prices with the chart we have to
        // Remedy the latest closing price
        setCoyInfo({ ...coyInfoData, close: chartDataResult.data.coordinates.slice(-1)[0].close });
        setQuoteData(chartDataResult.data.coordinates);
        setDuration(chartDataResult.data.duration);
        setLoadingCoyInfo(false);
        setLoadingChart(false);
        return axios.get(`/${selectedSymbol}/stats/`);
      })
      .then((statsResults) => {
        setKeyStats(statsResults.data);
        setSymbolInput('');
        setLoadingKeyStats(false);
      })
      .catch((error) => console.log(error));
  }

  function ToggleMonthPriceButton() {
    const chartTimeFrames = ['1m', '3m', '6m'];
    const listOfButtons = chartTimeFrames.map((timeFrame) => (
      <div className="timeframe-option">
        <Button variant="outline-dark" type="submit" onClick={() => { handleGetChart(timeFrame); }}>
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
