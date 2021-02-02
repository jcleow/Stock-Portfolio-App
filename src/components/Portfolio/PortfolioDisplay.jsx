import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import EditTradesModal from '../Trade/EditTradesModal.jsx';

export default function PortfolioDisplay({ portfolioStocks }) {
  const rowsOfStockData = portfolioStocks.map((stock, index) => {
    // Maintain the display of the number (of shares) delimited by commas
    const [inputVal, setInputVal] = useState('0');
    // Maintain the numbers of shares
    const [sharesInput, setSharesInput] = useState(0);
    const avgTotalVolumeDisplay = new Intl.NumberFormat()
      .format(Number((stock.avgTotalVolume / (10 ** 6)).toFixed(0)));

    const marketCapDisplay = new Intl.NumberFormat()
      .format(Number((stock.marketCap / (10 ** 6)).toFixed(0)));

    const fairValueDisplay = new Intl.NumberFormat()
      .format(Number(stock.totalSharesOwned * stock.close).toFixed(2));
    const historicalTrades = stock.trades;
    return (
      <tr>
        <td>{index + 1}</td>
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
          <EditTradesModal
            portfolioStockId={stock.portfolioStockId}
            portfolioId={stock.portfolioId}
            historicalTrades={historicalTrades}
            sharesOwned={stock.totalSharesOwned}
          />
        </td>
        <td>
          {fairValueDisplay}
        </td>
      </tr>
    );
  });
  return (
    <div className="offset-display">
      <Table striped bordered hover>
        <thead>
          <tr>
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
        </tbody>
      </Table>
    </div>
  );
}
