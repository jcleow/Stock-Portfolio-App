import React, { useState } from 'react';
import axios from 'axios';
import { Search } from 'react-bootstrap-icons';

export default function SearchCompanyInput({ searchProps }) {
  const { setCoyInfo, setSymbol } = searchProps;
  const [symbolInput, setSymbolInput] = useState('');

  const handleSearch = () => {
    axios.get(`/${symbolInput}/headlineInfo`)
      .then((result) => {
        setSymbol(symbolInput);
        setSymbolInput('');
        setCoyInfo(result.data);
      })
      .catch((error) => { console.log(error); });
  };
  const handleInput = (event) => {
    setSymbolInput(event.target.value);
  };

  return (
    <div>
      <input id="coy-lookup" placeholder="Symbol Lookup e.g KO" value={symbolInput} onChange={handleInput} />
      <button type="submit" onClick={handleSearch}><Search /></button>
    </div>
  );
}
