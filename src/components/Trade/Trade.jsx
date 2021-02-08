import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { addDays, getDay, subDays } from 'date-fns';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import NumberFormat from 'react-number-format';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';

export default function Trade({
  dataIndex, tradeStates, refreshPortfolioView, portfolioId, portfolioStockId, holidays,
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

  const listOfHolidays = holidays.map((day) => new Date(day));
  console.log(holidays, 'holidays');
  console.log(listOfHolidays, 'listOfHolidays');

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

  // Disable all weekends as markets are closed
  const isWeekday = (date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6;
  };

  const handleDeleteTrade = () => {
    axios.delete(`portfolios/${portfolioId}/portfolioStocks/${portfolioStockId}/trades/${id}/delete`)
      .then((updatedTradeDataResult) => {
        console.log(updatedTradeDataResult, 'result');
        setTradesData(updatedTradeDataResult.data.tradesData.trades);
        refreshPortfolioView(null, portfolioId);
      })
      .catch((err) => console.log(err));
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
          maxDate={addDays(new Date(), 0)}
          filterDate={isWeekday}
          excludeDates={[new Date(), subDays(new Date(), 1), ...listOfHolidays]}
        />
      </td>
      <td>
        <input value={shares} onChange={handleSharesTraded} type="number" placeholder="No. of shares" />
      </td>
      <td>
        <input value={costPrice} onChange={handleCostBasis} type="number" placeholder="Cost price" />
      </td>
      <td>

        {isNaN(totalCost) ? 0
          : <NumberFormat value={totalCost} displayType="text" thousandSeparator />}
      </td>
      <td>
        <DropdownButton variant="options-btn" id="dropdown-basic-button" title={<ThreeDotsVertical />}>
          <Dropdown.Item as="button" type="submit" value="BUY" onClick={handleDeleteTrade}>
            Delete This Trade
          </Dropdown.Item>
        </DropdownButton>
      </td>
    </tr>
  );
}
