import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';

export default function Trade({
  newTradesData, setTradesData, tempId, histTradesData, tradeId, dataIndex,
}) {
  // If historical trade data exists, populate the row with data
  let histPosition = '';
  let histTradeDate;
  let histShares;
  let histCostPrice;
  if (histTradesData) {
    const {
      position,
      tradeDate,
      shares,
      costPrice,
    } = histTradesData[dataIndex];
    histPosition = position;
    histTradeDate = moment(tradeDate).format('YYYY-MM-DD');
    histShares = shares;
    histCostPrice = costPrice;
  } else {
    const {
      position, tradeDate, shares, costPrice,
    } = newTradesData;
    histPosition = position;
    histTradeDate = moment(tradeDate).format('YYYY-MM-DD');
    histShares = shares;
    histCostPrice = costPrice;
  }
  // Manage input states
  const [selectedPosition, setSelectedPosition] = useState(histPosition);
  const [tradeDate, setTradeDate] = useState(histTradeDate);
  const [sharesTraded, setSharesTraded] = useState(histShares);
  const [costBasis, setCostBasis] = useState(histCostPrice);
  const [totalCost, setTotalCost] = useState(0);

  let initTradeData;
  if (histTradesData) {
    initTradeData = [...histTradesData];
  } else {
    initTradeData = [...newTradesData];
  }

  const [currTradeData, setCurrTradeData] = useState(initTradeData);

  // Helper that alters the array of tradesData
  const updateTradesData = (event, dataProp) => {
    // Loop through shallow copy to alter the right trade data
    const allTradesDataCopy = currTradeData.map((tradeData) => {
      if (tradeData.tempId) {
        if (tradeData.tempId === tempId) {
          const newData = { ...tradeData, [dataProp]: event.target.value };
          console.log(newData, 'newData');
          return newData;
        }
      } else if (tradeData.id === tradeId) {
        const newData = { ...tradeData, [dataProp]: event.target.value };
        return newData;
      }

      return tradeData;
    });
    // Update the tradesData state
    console.log(allTradesDataCopy, 'allTradesDataCopy');
    setCurrTradeData(allTradesDataCopy);
    setTradesData([...allTradesDataCopy]);
  };
  const handleTradeDate = (event) => {
    updateTradesData(event, 'tradeDate');
    setTradeDate(event.target.value);
  };
  const handleSharesTraded = (event) => {
    updateTradesData(event, 'shares');
    setSharesTraded(event.target.value);
  };
  const handleCostBasis = (event) => {
    updateTradesData(event, 'costPrice');
    setCostBasis(event.target.value);
  };
  const handleSelectedPosition = (event) => {
    updateTradesData(event, 'position');
    setSelectedPosition(event.target.value);
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
        {histTradesData && histTradesData[dataIndex].id}
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
