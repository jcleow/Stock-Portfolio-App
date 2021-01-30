import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

function PortfolioButtonList({ portfolioButtonsProps }) {
  const { portfolioList, setPortfolioStocks } = portfolioButtonsProps;
  const handleSelectPortfolio = (event) => {
    const portfolioId = event.target.value;
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        console.log(result, 'result');
        setPortfolioStocks(result.data.portfolioStocks.stocks);
      })
      .catch((error) => console.log(error));
  };

  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (<Button variant="primary" value={portfolioId} onClick={handleSelectPortfolio}>{portfolio.name}</Button>);
  });
  return (
    <div className="offset-display">
      {portfolioButtonList}
    </div>
  );
}

function PortfolioDisplay({ portfolioStocks }) {
  const rowsOfStockData = portfolioStocks.map((stock) => (
    <tr>
      <td>{stock.id}</td>
      <td>{stock.stockSymbol}</td>
      <td>{stock.stockName}</td>
    </tr>
  ));
  return (
    <div className="offset-display">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change</th>
            <th>% Change</th>
            <th>Volume</th>
            <th>Market Cap</th>
            <th>Shares</th>
            <th>Fair Value</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfStockData}
        </tbody>
      </Table>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioStocks, setPortfolioStocks] = useState([]);

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList, setUsername,
  };

  const portfolioButtonsProps = {
    portfolioList, setPortfolioStocks,
  };

  // Buggy where a randomized string of char and number appears briefly before username is displayed
  useEffect(() => {
    if (document.cookie) {
      setLoggedIn(true);

      const splitCookieVal = document.cookie.split(' ');
      const startPos = splitCookieVal[0].indexOf('=') + 1;
      const endPos = splitCookieVal[0].indexOf(';');
      const loggedInUsername = splitCookieVal[0].substring(startPos, endPos);
      setUsername(loggedInUsername);
    }
  }, []);
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      {display === 'main'
      && <MainDisplay />}
      {display === 'portfolio'
      && (
      <div>
        <PortfolioButtonList portfolioButtonsProps={portfolioButtonsProps} />
        <PortfolioDisplay portfolioStocks={portfolioStocks} />
      </div>
      )}
    </div>
  );
}
