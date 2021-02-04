import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, subDays } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';

export default function Trade({
  dataIndex, tradeStates,
}) {
  const {
    tradesData,
    setTradesData,
  } = tradeStates;

  const {
    id,
    position,
    tradeDate,
    shares,
    costPrice,
  } = tradesData[dataIndex];
  console.log(tradesData, 'tradesData');
  console.log(tradesData[dataIndex], 'tradesDataIndex');

  const [currTradeData, setCurrTradeData] = useState(tradesData[dataIndex]);
  const [startDate, setStartDate] = useState(new Date(tradeDate));

  // Helper that alters the array of tradesData
  const updateTradesData = (event, dataProp) => {
    let updatedValue;
    if (dataProp === 'costPrice' || dataProp === 'shares') {
      updatedValue = Number(event.target.value);
    } else if (dataProp === 'tradeDate') {
      updatedValue = new Date(event);
    } else {
      updatedValue = event.target.value;
    }

    const currTradeDataCopy = { ...currTradeData, [dataProp]: updatedValue };
    const allTradesDataCopy = [...tradesData];
    allTradesDataCopy[dataIndex] = currTradeDataCopy;
    // Update the tradesData state
    setCurrTradeData(currTradeDataCopy);
    setTradesData(allTradesDataCopy);
  };
  const handleTradeDate = (event) => {
    setStartDate(event);
    console.log(event, 'event');
    updateTradesData(event, 'tradeDate');
  };
  const handleSharesTraded = (event) => {
    updateTradesData(event, 'shares');
  };
  const handleCostBasis = (event) => {
    updateTradesData(event, 'costPrice');
  };
  const handleSelectedPosition = (event) => {
    updateTradesData(event, 'position');
  };

  const totalCost = shares * costPrice;

  return (
    <tr>
      <td>
        {id}
      </td>
      <td>
        <DropdownButton id="dropdown-basic-button" title={position}>
          <Dropdown.Item as="button" type="submit" value="BUY" onClick={handleSelectedPosition}>
            BUY
          </Dropdown.Item>
          <Dropdown.Item as="button" type="submit" value="SELL" onClick={handleSelectedPosition}>
            SELL
          </Dropdown.Item>
        </DropdownButton>
      </td>
      <td>
        <DatePicker
          selected={startDate}
          onChange={handleTradeDate}
          minDate={subDays(new Date(), 30)}
          maxDate={addDays(new Date(), 0)}
        />
      </td>
      <td>
        <input value={shares} onChange={handleSharesTraded} type="number" placeholder="No. of shares" />
      </td>
      <td>
        <input value={costPrice} onChange={handleCostBasis} type="number" placeholder="Cost price" />
      </td>
      <td>{isNaN(totalCost) ? 0 : totalCost }</td>
    </tr>
  );
}
