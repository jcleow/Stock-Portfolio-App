import React, { useState } from 'react';
import axios from 'axios';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineMarkSeries,
  LineSeriesCanvas,
  Crosshair,
} from 'react-vis';

function StockDisplay({ quoteData }) {
  const dataPoints = quoteData.map((data, index) => {
    const dataPoint = { x: data.date, y: Number(data.close) };
    return dataPoint;
  });
  const [value, setValue] = useState({ value: null });

  const forgetValue = () => {
    setValue({ value: null });
  };
  const rememberValue = (val) => {
    setValue({ val });
  };

  return (
    <div className="container">
      <div>
        <XYPlot height={500} width={500} xType="ordinal">
          <HorizontalGridLines />
          <VerticalGridLines />
          {/* <XAxis /> */}
          <YAxis />
          <LineMarkSeries
            onValueMouseOver={rememberValue}
            onValueMouseOut={forgetValue}
            data={dataPoints}
          />
        </XYPlot>
      </div>
    </div>
  );
}

export default function App() {
  const [quoteData, setQuoteData] = useState([]);

  function handleGetQuote() {
    axios.get('/quote')
      .then((result) => {
        setQuoteData(result.data);
      });
  }

  function GetQuoteButton() {
    return (
      <div>
        <button type="submit" onClick={handleGetQuote}>
          Get Quote
        </button>
      </div>
    );
  }

  return (
    <div>
      <GetQuoteButton />
      <StockDisplay quoteData={quoteData} />
    </div>
  );
}
