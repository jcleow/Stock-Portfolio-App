import React, { useState } from 'react';
import axios from 'axios';

export default function AddStockToPortfolioBtn({
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
        <button type="button" className="add-symbol-btn" onClick={handleAddSymbol}>+</button>
      </td>
      <td />
    </tr>
  );
}
