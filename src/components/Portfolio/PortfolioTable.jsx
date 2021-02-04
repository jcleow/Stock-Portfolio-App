import React, { useState } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import EditTradesModal from '../Trade/EditTradesModal.jsx';

function AddStockToPortfolioBtn({ currPortfolioId }) {
  const [newSymbol, setNewSymbol] = useState();
  const handleNewSymbol = (event) => {
    setNewSymbol(event.target.value);
  };

  const handleAddSymbol = () => {
    axios.post(`/portfolios/${currPortfolioId}/addSymbol`, { newSymbol })
      .then((result) => {
        console.log(result, 'result');
      })
      .catch((err) => console.log(err));
  };
  return (
    <tr>
      <td />
      <td />
      <td>
        <input placeholder="input symbol" value={newSymbol} onChange={handleNewSymbol} />
        <Button variant="outline-primary" className="options" onClick={handleAddSymbol}>+</Button>
      </td>
      <td />
      <td />
      <td />
      <td />
      <td />
      <td />
      <td />
      <td />
    </tr>
  );
}

export default function PortfolioTable({ portfolioStocks, refreshPortfolioView, currPortfolioId }) {
  let rowsOfStockData;
  // Replace the following if condition with errorboundary?
  if (portfolioStocks) {
    console.log(portfolioStocks, 'portfolioStocks');
    rowsOfStockData = portfolioStocks.map((stock, index) => {
      const avgTotalVolumeDisplay = new Intl.NumberFormat()
        .format(Number((stock.avgTotalVolume / (10 ** 6)).toFixed(0)));

      const marketCapDisplay = new Intl.NumberFormat()
        .format(Number((stock.marketCap / (10 ** 6)).toFixed(0)));

      const fairValueDisplay = new Intl.NumberFormat()
        .format(Number(stock.totalSharesOwned * stock.close).toFixed(2));
      const historicalTrades = stock.trades;

      return (
        <tr>
          <td>
            <EditTradesModal
              portfolioStockId={stock.portfolioStockId}
              portfolioId={stock.portfolioId}
              historicalTrades={historicalTrades}
              refreshPortfolioView={refreshPortfolioView}
            />
          </td>
          <td>
            {index + 1}
          </td>
          <td>{stock.symbol}</td>
          <td>{stock.companyName}</td>
          <td>{stock.close}</td>
          <td>{stock.change}</td>
          <td>{stock.changePercent}</td>
          <td>
            {avgTotalVolumeDisplay}
          </td>
          <td>
            {marketCapDisplay}
          </td>
          <td>
            {stock.totalSharesOwned}
          </td>
          <td>
            {fairValueDisplay}
          </td>
        </tr>
      );
    });
  }
  return (
    <div className="offset-display">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th />
            <th>#</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price $</th>
            <th>Change</th>
            <th>% Change</th>
            <th>Volume $(M)</th>
            <th>Market Cap $(M)</th>
            <th>Shares</th>
            <th>Fair Value ($)</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfStockData}
          <AddStockToPortfolioBtn currPortfolioId={currPortfolioId} />
        </tbody>
      </Table>

    </div>
  );
}
