import axios from 'axios';
import React, { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

function PortfolioDisplay({ portfolioList }) {
  const [portfolioStocksDisplay, setPortfolioStocksDisplay] = useState([]);
  const handleSelectPortfolio = (event) => {
    const portfolioId = event.target.value;
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        console.log(result, 'result');
        setPortfolioStocksDisplay(result.data.portfolioStocks);
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
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>

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
  console.log(portfolioList, 'portfolioList');

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList,
  };
  // Helper function to check which user is logged in
  function checkLoggedIn() {
    axios.get('/checkLoggedIn')
      .then((result) => {
        if (result.data.auth) {
          setLoggedIn(true);
          setUsername(result.data.username);
        }
      })
      .catch((error) => console.log(error));
  }
  checkLoggedIn();

  // function getUsername() {
  //   console.log('num times getUsername is run');
  //   if (document.cookie) {
  //     setLoggedIn(true);
  //     setUsername(document.cookie);
  //   }
  // }

  // getUsername();
  // console.log(document.cookie, 'document.cookie');
  console.log('test-1');
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      {display === 'main'
      && <MainDisplay />}
      {display === 'portfolio'
      && <PortfolioDisplay portfolioList={portfolioList} />}
    </div>
  );
}
