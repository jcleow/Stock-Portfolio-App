import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';

export default function Trade({
  newTradesData, setTradesData, tempId, histTradeData,
}) {
  // If historical trade data exists, populate the row with data
  let histPosition = '';
  let histTradeDate;
  let histShares;
  let histCostPrice;

  if (histTradeData) {
    const {
      position,
      tradeDate,
      shares,
      costPrice,
    } = histTradeData;
    histPosition = position;
    histTradeDate = moment(tradeDate).format('YYYY-MM-DD');
    histShares = shares;
    histCostPrice = costPrice;
  }
  console.log(histTradeData, 'histTradeData');
  // Manage input states
  const [selectedPosition, setSelectedPosition] = useState(histPosition);
  const [tradeDate, setTradeDate] = useState(histTradeDate);
  const [sharesTraded, setSharesTraded] = useState(histShares);
  const [costBasis, setCostBasis] = useState(histCostPrice);
  const [totalCost, setTotalCost] = useState(0);

  // Helper that alters the array of tradesData
  const updateTradesData = (event, dataProp) => {
    let allTradesDataCopy;
    if (histTradeData) {
      allTradesDataCopy = [{ ...histTradeData }];
    } else if (newTradesData) {
      allTradesDataCopy = [...newTradesData];
    }

    // Loop through shallow copy to alter the right trade data
    allTradesDataCopy.forEach((tradeData) => {
      console.log(allTradesDataCopy, 'allTradesDataCopy');
      if (tradeData.tempId) {
        if (tradeData.tempId === tempId) {
          tradeData[dataProp] = event.target.value;
        }
      }
    });

    // Update the tradesData state
    setTradesData(allTradesDataCopy);
  };
  const handleTradeDate = (event) => {
    setTradeDate(event.target.value);
    updateTradesData(event, 'tradeDate');
  };
  const handleSharesTraded = (event) => {
    setSharesTraded(event.target.value);
    updateTradesData(event, 'shares');
  };
  const handleCostBasis = (event) => {
    setCostBasis(event.target.value);
    updateTradesData(event, 'costPrice');
  };
  const handleSelectedPosition = (event) => {
    setSelectedPosition(event.target.value);
    updateTradesData(event, 'position');
  };

  // Render the total cost everytime component is re-rendered
  useEffect(() => {
    if (sharesTraded >= 0 && costBasis >= 0) {
      setTotalCost(sharesTraded * costBasis);
    }
  }, [sharesTraded, costBasis]);
  return (
    <tr>
      <td>
        {histTradeData && histTradeData.id}
      </td>
      <td>
        <DropdownButton id="dropdown-basic-button" title={selectedPosition}>
          <Dropdown.Item as="button" type="submit" value="BUY" onClick={handleSelectedPosition}>
            BUY
          </Dropdown.Item>
          <Dropdown.Item as="button" type="submit" value="SELL" onClick={handleSelectedPosition}>
            SELL
          </Dropdown.Item>
        </DropdownButton>
      </td>
      <td>
        <input value={tradeDate} onChange={handleTradeDate} type="date" />
      </td>
      <td>
        <input value={sharesTraded} onChange={handleSharesTraded} type="number" placeholder="No. of shares" />
      </td>
      <td>
        <input value={costBasis} onChange={handleCostBasis} type="number" placeholder="Cost price" />
      </td>
      <td>{totalCost}</td>
    </tr>
  );
}
