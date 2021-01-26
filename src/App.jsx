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
  Hint,
} from 'react-vis';

function StockDisplay({ quoteData }) {
  const dataPoints = quoteData.map((data, index) => {
    const dataPoint = { x: data.date, y: Number(data.close) };
    return dataPoint;
  });
  const [value, setValue] = useState(null);
  // setting for the lowest point in the y axis
  const YLOW = 45;

  const forgetValue = () => {
    setValue(null);
  };
  const rememberValue = (val) => {
    setValue(val);
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
            onNearestX={rememberValue}
            onValueMouseOut={forgetValue}
            data={dataPoints}
            size={2}
          />
          {value ? (
            <LineSeries
              data={[{ x: value.x, y: value.y }, { x: value.x, y: YLOW }]}
              stroke="grey"
              size={1}
            />
          ) : null}
          {value
          && (
          <Hint value={value}>
            <div className="rv-hint_content" style={{ background: 'lightgray', color: 'black' }}>
              <p>
                Date:
                {value.x}
              </p>
              <p>
                Price:$
                {value.y}
              </p>
            </div>
          </Hint>
          )}
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
