import React, { useState } from 'react';
import axios from 'axios';
import NumberFormat from 'react-number-format';
import StockOptionsButton from '../Trade/StockOptionsButton.jsx';

function AddStockToPortfolioBtn({
  currPortfolioId, refreshPortfolioView,
}) {
  const [newSymbol, setNewSymbol] = useState();
  const handleNewSymbol = (event) => {
    setNewSymbol(event.target.value);
  };
  const handleAddSymbol = () => {
    // If user does not key in a symbol, alert user to key a legit symb
    if (!newSymbol) {
      alert('You must key in a symbol! E.g Coca Cola: KO');
      return;
    }
    const upperCaseSymbol = newSymbol.toUpperCase();
    axios.post(`/portfolios/${currPortfolioId}/addSymbol`, { newSymbol: upperCaseSymbol })
      .then((result) => {
        if (result.data.err) {
          alert('You did not key in a legit symbol, please try again');
          setNewSymbol('');
        }
        refreshPortfolioView(null, currPortfolioId);
        setNewSymbol('');
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <tr>
      <td />
      <td />
      <td colSpan="6">
        <input placeholder="Input symbol (e.g KO)" className="symbol-input" value={newSymbol} onChange={handleNewSymbol} />
        <button className="add-symbol-btn" onClick={handleAddSymbol}>+</button>
      </td>
      <td />
    </tr>
  );
}

export default function PortfolioTable({
  portfolioStocks, refreshPortfolioView, currPortfolioId, addSymbLoadingProps,
}) {
  const { loadingNewSymbol, setLoadingNewSymbol } = addSymbLoadingProps;

  // Track the new symbol that is being entered
  let rowsOfStockData;
  // Replace the following if condition with errorboundary?
  if (portfolioStocks) {
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
            <StockOptionsButton
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
          <td><NumberFormat value={stock.changePercent * 100} displayType="text" decimalScale={2} fixedDecimalScale /></td>
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
    <div className="table-fix-head">
      <table>
        <thead>
          <tr>
            <th />
            <th>No.</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price ($)</th>
            <th>Change</th>
            <th>% Change</th>
            <th>
              Volume ($
              {'\''}
              m)
            </th>
            <th>
              Market Cap ($
              {'\''}
              m)
            </th>
            <th>Shares</th>
            <th>Fair Value ($)</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfStockData}
          { loadingNewSymbol
            ? <img src="/doublering.gif" alt="loading" />
            : (
              <AddStockToPortfolioBtn
                currPortfolioId={currPortfolioId}
                refreshPortfolioView={refreshPortfolioView}
                loadingNewSymbol={loadingNewSymbol}
              />
            )}
        </tbody>
      </table>
    </div>
  );
}
