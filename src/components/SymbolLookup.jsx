import React from 'react';
import { Search } from 'react-bootstrap-icons';

export default function SymbolLookup({ symbolLookUpProps }) {
  const { symbolInput, setSymbolInput, handleGetChart } = symbolLookUpProps;

  const handleInput = (event) => {
    setSymbolInput(event.target.value);
  };

  return (
    <div>
      <input id="coy-lookup" className="symbol-lookup" placeholder="Symbol Lookup e.g KO" value={symbolInput} onChange={handleInput} />
      <button type="submit" className="transparent-btn" onClick={() => { handleGetChart('1m'); }}><Search /></button>
    </div>
  );
}
