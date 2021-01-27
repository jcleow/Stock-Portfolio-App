import React, { useState } from 'react';
import axios from 'axios';

import PriceChart from './components/PriceChart.jsx';
import CoyInfo from './components/CoyInfo.jsx';
import SymbolLookup from './components/SymbolLookup.jsx';
import StockKeyStats from './components/StockKeyStats.jsx';

export default function App() {
  // Track the price quote data for the price chart
  const [quoteData, setQuoteData] = useState([]);
  const [duration, setDuration] = useState('');
  // Track the coyInfoData
  const [coyInfo, setCoyInfo] = useState([]);
  // Track the currently selected symbol
  const [symbol, setSymbol] = useState('');
  // Track the keystats of currently selected symbol
  const [keyStats, setKeyStats] = useState(null);

  // All props to be sent into the various components
  const searchProps = { setCoyInfo, setSymbol, setKeyStats };
  const priceChartProps = { quoteData, duration };

  function handleGetChart(timeDuration) {
    axios.get(`/${symbol}/chart/${timeDuration}`)
      .then((result) => {
        setQuoteData(result.data.coordinates);
        setDuration(result.data.duration);
        return axios.get(`/${symbol}/stats/`);
      })
      .then((statsResults) => {
        setKeyStats(statsResults.data);
      })
      .catch((error) => console.log(error));
  }

  function ToggleMonthPriceButton() {
    return (
      <div>
        <button type="submit" onClick={() => { handleGetChart('1m'); }}>
          1M
        </button>
        <button type="submit" onClick={() => { handleGetChart('3m'); }}>
          3M
        </button>
        <button type="submit" onClick={() => { handleGetChart('6m'); }}>
          6M
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="container mt-5">
        <div className="row">
          <div className="col d-flex justify-content-between">
            <SymbolLookup searchProps={searchProps} />
            <ToggleMonthPriceButton />
          </div>
        </div>
      </div>
      {symbol
        ? <CoyInfo coyInfo={coyInfo} />
        : null}
      <PriceChart priceChartProps={priceChartProps} />
      {keyStats
      && <StockKeyStats keyStats={keyStats} />}
    </div>
  );
}
