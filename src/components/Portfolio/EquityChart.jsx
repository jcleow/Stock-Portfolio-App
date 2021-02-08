import React, { useState } from 'react';
import {
  XYPlot,
  XAxis,
  ChartLabel,
  LineSeries,
  LineMarkSeries,
  Hint,
  GradientDefs,
  AreaSeries,
} from 'react-vis';
import NumberFormat from 'react-number-format';

export default function EquityChart({ equityChartProps }) {
  const { equityCurveData, accCostCurveData, timeFrame } = equityChartProps;

  // To replace with error boundary?
  if (!equityCurveData) {
    return (<XYPlot onMouseLeave={() => { setValue(null); }} height={400} width={1000} xType="ordinal" />);
  }
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

  const dateDisplayFactor = () => {
    let factor = 0;
    if (timeFrame === '1m') {
      factor = 3;
    } else if (timeFrame === '3m') {
      factor = 6;
    } else if (timeFrame === '6m') {
      factor = 15;
    }
    return factor;
  };

  const allDates = Object.keys(equityCurveData);
  const dataPoints = allDates.map((date) => {
    const mmdd = date.substring(date.length - 5, date.length);
    const dataPoint = { x: mmdd, y: equityCurveData[date] };
    return dataPoint;
  });

  const xAxisTickValues = [];
  dataPoints.forEach((datapoint, index) => {
    if (index % dateDisplayFactor() === 0) {
      const mmdd = datapoint.x;
      xAxisTickValues.push(mmdd);
    }
  });

  // setting for the lowest point in the y axis
  const YLOW = getLowestPrice(dataPoints);

  return (
    <div>
      <div className="d-flex justify-content-center">
        <XYPlot onMouseLeave={() => { setValue(null); }} height={400} width={1000} xType="ordinal">
          <XAxis tickValues={xAxisTickValues} />
          <LineMarkSeries
            onNearestX={rememberValue}
            onValueMouseOut={forgetValue}
            color="#846AFD"
            data={dataPoints}
            size={0}
          />
          <GradientDefs>
            <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#846AFD" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FAF9FF" stopOpacity={0.1} />
            </linearGradient>
          </GradientDefs>
          <AreaSeries
            color="url(#CoolGradient)"
            data={dataPoints}
          />
          {value ? (
            <LineSeries
              data={[{ x: value.x, y: value.y }, { x: value.x, y: YLOW }]}
              stroke="#f5f6fa"
              size={1}
            />
          ) : null}
          {value
          && (
          <Hint value={value}>
            <div className="rv-hint_content" style={{ background: 'rgba(255, 255, 255, 0.5)', color: 'rgba(0,0,0, 0.6)' }}>
              <p>
                Date:
                {' '}
                <b>{value.x}</b>
              </p>
              <p>
                Total Value:
                {' '}
                <b><NumberFormat value={Number(value.y)} displayType="text" thousandSeparator prefix="$" decimalScale={0} fixedDecimalScale /></b>
              </p>
            </div>
          </Hint>
          )}
        </XYPlot>
      </div>
      {/* {YLOW === Infinity
        && <div>Add a stock and trade to continue</div>} */}
    </div>
  );
}
