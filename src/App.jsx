import React, { useState } from 'react';
import axios from 'axios';
import StockDisplay from './components/StockDisplay.jsx';

export default function App() {
  const [quoteData, setQuoteData] = useState([]);
  const [duration, setDuration] = useState('');

  function handleGetQuote(duration) {
    axios.get(`/quote/${duration}`)
      .then((result) => {
        console.log(result, 'result');
        setQuoteData(result.data.coordinates);
        setDuration(result.data.duration);
      });
  }

  function Get1MQuoteButton() {
    return (
      <div className="container d-flex justify-content-end">
        <button type="submit" onClick={() => { handleGetQuote('1m'); }}>
          1M
        </button>
        <button type="submit" onClick={() => { handleGetQuote('3m'); }}>
          3M
        </button>
        <button type="submit" onClick={() => { handleGetQuote('6m'); }}>
          6M
        </button>
      </div>
    );
  }

  return (
    <div>
      <Get1MQuoteButton />
      <StockDisplay quoteData={quoteData} duration={duration} />
    </div>
  );
}
