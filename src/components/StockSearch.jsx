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
    setQuoteData,
    setDuration,
    setKeyStats,
    setSymbol,
    setCoyInfo,
  } = stockSearchProps;
  // // Track the coyInfoData
  // const [coyInfo, setCoyInfo] = useState([]);
  // // Track the currently selected symbol
  // const [symbol, setSymbol] = useState('');

  function handleGetChart(timeFrame) {
    let coyInfoData;
    axios.get(`/${symbolInput}/headlineInfo`)
      .then((result) => {
        setSymbol(result.data.symbol);
        coyInfoData = result.data;
        return axios.get(`/${symbolInput}/chart/${timeFrame}`);
      })
      .then((chartDataResult) => {
        // Due to IEX inconsistent prices with the chart we have to
        // Remedy the latest closing price
        setCoyInfo({ ...coyInfoData, close: chartDataResult.data.coordinates.slice(-1)[0].close });
        setQuoteData(chartDataResult.data.coordinates);
        setDuration(chartDataResult.data.duration);
        return axios.get(`/${symbolInput}/stats/`);
      })
      .then((statsResults) => {
        console.log(statsResults, 'statsResults');
        setKeyStats(statsResults.data);
        setSymbolInput('');
      })
      .catch((error) => console.log(error));
  }

  function ToggleMonthPriceButton() {
    const chartTimeFrames = ['1m', '3m', '6m'];
    const listOfButtons = chartTimeFrames.map((timeFrame) => (
      <Button variant="outline-dark" type="submit" onClick={() => { handleGetChart(timeFrame); }}>
        {timeFrame}
      </Button>
    ));
    return listOfButtons;
  }
  // All props to be sent into the various components
  const symbolLookUpProps = {
    symbolInput, setSymbolInput, handleGetChart,
  };
  const priceChartProps = { quoteData, duration };

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col d-flex justify-content-between">
            <SymbolLookup symbolLookUpProps={symbolLookUpProps} />
            <div>
              <ToggleMonthPriceButton />
            </div>
          </div>
        </div>
      </div>
      {symbol
        ? <CoyInfo coyInfo={coyInfo} />
        : null}
      <PriceChart priceChartProps={priceChartProps} />
      <div className="offset-display">
        {keyStats
      && <StockKeyStats keyStats={keyStats} />}
      </div>
    </div>
  );
}
