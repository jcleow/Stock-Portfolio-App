import React, { useState } from 'react';
import axios from 'axios';

import PriceChart from './components/PriceChart.jsx';
import CoyInfo from './components/CoyInfo.jsx';
import SearchCompanyInput from './components/SearchCompanyInput.jsx';

// function SearchCompanyInput({ searchProps }) {
//   const { setCoyInfo, setSymbol } = searchProps;
//   const [symbolInput, setSymbolInput] = useState('');

//   const handleSearch = () => {
//     axios.get(`/${symbolInput}/company`)
//       .then((result) => {
//         setSymbol(symbolInput);
//         setSymbolInput('');
//         setCoyInfo(result.data);
//       })
//       .catch((error) => { console.log(error); });
//   };
//   const handleInput = (event) => {
//     setSymbolInput(event.target.value);
//   };

//   return (
//     <div>
//       <label htmlFor="coy-lookup">Symbol Lookup</label>
//       <input id="coy-lookup" value={symbolInput} onChange={handleInput} />
//       <button type="submit" onClick={handleSearch}><Search /></button>
//     </div>
//   );
// }

// function CoyInfo({ coyInfo }) {
//   const {
//     companyName, latestPrice, change, changePercent, isUSMarketOpen,
//   } = coyInfo;
//   console.log(coyInfo);
//   return (
//     <div className="container">
//       <h1>{companyName}</h1>
//       <h2>{latestPrice}</h2>
//       <h5>
//         {change > 0 && '+' }
//         {change}
//       </h5>
//       <h5>
//         {changePercent > 0 && '+'}
//         {changePercent}
//         %
//       </h5>
//       <h6>{isUSMarketOpen ? 'Open' : 'Closed'}</h6>
//     </div>
//   );
// }

export default function App() {
  // Track the price quote data for the price chart
  const [quoteData, setQuoteData] = useState([]);
  const [duration, setDuration] = useState('');
  // Track the coyInfoData
  const [coyInfo, setCoyInfo] = useState([]);
  // Track the currently selected symbol
  const [symbol, setSymbol] = useState('');

  // All props to be sent into the various components
  const searchProps = { setCoyInfo, setSymbol };
  const priceChartProps = { quoteData, duration };

  function handleGetChart(timeDuration) {
    axios.get(`/${symbol}/chart/${timeDuration}`)
      .then((result) => {
        setQuoteData(result.data.coordinates);
        setDuration(result.data.duration);
      });
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
            <SearchCompanyInput searchProps={searchProps} />
            <ToggleMonthPriceButton />
          </div>
        </div>
      </div>
      {symbol
        ? <CoyInfo coyInfo={coyInfo} />
        : null}
      <PriceChart priceChartProps={priceChartProps} />
    </div>
  );
}
