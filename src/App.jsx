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
  Hint,
} from 'react-vis';

function StockDisplay({ quoteData }) {
  // Set the state for the hint value
  const [value, setValue] = useState(null);

  // Helper that retrieves the lowest price for the display of the hint
  const getLowestPrice = (dataset) => {
    // looping through data points to get the lowest price
    const arrayOfPrices = dataset.map((datapoint) => datapoint.y);
    return Math.min(...arrayOfPrices);
  };
  // Handler for hovering away from curr data point
  const forgetValue = () => {
    setValue(null);
  };
  // Handler for hovering into another data point
  const rememberValue = (val) => {
    setValue(val);
  };

  // Get all the co-ordinates of the relevant date and prices
  const dataPoints = quoteData.map((data, index) => {
    const mmdd = data.date.substring(data.date.length - 5, data.date.length);
    const dataPoint = { x: mmdd, y: Number(data.close) };
    return dataPoint;
  });

  const xAxisTickValues = [];
  dataPoints.forEach((datapoint, index) => {
    if (index % 3 === 0) {
      const mmdd = datapoint.x;
      xAxisTickValues.push(mmdd);
    }
  });

  // setting for the lowest point in the y axis
  const YLOW = getLowestPrice(dataPoints);

  return (
    <div className="container">
      <div>
        <XYPlot onMouseLeave={() => { setValue(null); }} height={500} width={500} xType="ordinal">
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis tickValues={xAxisTickValues} />
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
