import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioButtonList from './components/Portfolio/PortfolioButtonList.jsx';
import PortfolioTable from './components/Portfolio/PortfolioTable.jsx';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';
import EquityChart from './components/Portfolio/EquityChart.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [equityChartData, setEquityChartData] = useState([]);
  console.log(portfolioStocks, 'portfolioStocks');
  // For purposes of charting equity curve
  const timeFrame = '1m';
  const equityChartProps = { equityChartData, timeFrame };

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList, setUsername,
  };

  const portfolioButtonsProps = {
    portfolioList, setPortfolioStocks,
  };

  const refreshPortfolioView = (event, targetPortfolioId) => {
    let portfolioId;
    if (!targetPortfolioId) {
      portfolioId = event.target.value;
    } else {
      portfolioId = targetPortfolioId;
    }
    return axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        console.log(result, 'result-0');
        setPortfolioStocks(result.data.essentialQuoteInfo);
        setEquityChartData(result.data.portfolioValueTimeSeries);
      })
      .catch((error) => console.log(error));
  };

  // To make sure username is shown
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
        <EquityChart equityChartProps={equityChartProps} />
        <PortfolioButtonList
          portfolioButtonsProps={portfolioButtonsProps}
          refreshPortfolioView={refreshPortfolioView}
        />
        <PortfolioTable
          portfolioStocks={portfolioStocks}
          refreshPortfolioView={refreshPortfolioView}
        />
      </div>
      )}
    </div>
  );
}
