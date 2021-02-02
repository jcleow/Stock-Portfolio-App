import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';

export default function Trade({
  tradeId, histTradesData, dataIndex, tradeStates,
}) {
  const {
    selectedPosition,
    tradeDate,
    sharesTraded,
    costBasis,
    totalCost,
    tradesData,
    setSelectedPosition,
    setTradeDate,
    setSharesTraded,
    setCostBasis,
    setTotalCost,
    setTradesData,
  } = tradeStates;
  const [currTradeData, setCurrTradeData] = useState(tradesData[dataIndex]);

  // Helper that alters the array of tradesData
  const updateTradesData = (event, dataProp) => {
    const currTradeDataCopy = { ...currTradeData, [dataProp]: event.target.value };
    const allTradesDataCopy = [...tradesData];
    allTradesDataCopy[dataIndex] = currTradeDataCopy;

    // Update the tradesData state
    setCurrTradeData(currTradeDataCopy);
    setTradesData(allTradesDataCopy);
  };
  const handleTradeDate = (event) => {
    const newTradeDate = moment(event.target.value).format('YYYY-MM-DD');
    const newTradeDateArray = [...tradeDate];
    newTradeDateArray[dataIndex] = newTradeDate;
    setTradeDate(newTradeDateArray);
    updateTradesData(event, 'tradeDate');
  };
  const handleSharesTraded = (event) => {
    const newSharesTraded = event.target.value;
    const newSharesTradedArray = [...sharesTraded];
    newSharesTradedArray[dataIndex] = newSharesTraded;
    setSharesTraded(newSharesTradedArray);
    updateTradesData(event, 'shares');
  };
  const handleCostBasis = (event) => {
    const newCostBasis = event.target.value;
    const newCostBasisArray = [...costBasis];
    newCostBasisArray[dataIndex] = newCostBasis;
    setCostBasis(newCostBasisArray);
    updateTradesData(event, 'costPrice');
  };
  const handleSelectedPosition = (event) => {
    const newSelectedPosition = event.target.value;
    const newSelectedPositionArray = [...selectedPosition];
    newSelectedPositionArray[dataIndex] = newSelectedPosition;
    setSelectedPosition(newSelectedPositionArray);
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
        {histTradesData && histTradesData[dataIndex].id}
      </td>
      <td>
        <DropdownButton id="dropdown-basic-button" title={selectedPosition[dataIndex]}>
          <Dropdown.Item as="button" type="submit" value="BUY" onClick={handleSelectedPosition}>
            BUY
          </Dropdown.Item>
          <Dropdown.Item as="button" type="submit" value="SELL" onClick={handleSelectedPosition}>
            SELL
          </Dropdown.Item>
        </DropdownButton>
      </td>
      <td>
        <input value={tradeDate[dataIndex]} onChange={handleTradeDate} type="date" />
      </td>
      <td>
        <input value={sharesTraded[dataIndex]} onChange={handleSharesTraded} type="number" placeholder="No. of shares" />
      </td>
      <td>
        <input value={costBasis[dataIndex]} onChange={handleCostBasis} type="number" placeholder="Cost price" />
      </td>
      <td>{totalCost}</td>
    </tr>
  );
}
