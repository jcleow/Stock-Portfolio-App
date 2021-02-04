import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioButtonList from './components/Portfolio/PortfolioButtonList.jsx';
import PortfolioTable from './components/Portfolio/PortfolioTable.jsx';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';
import EquityChart from './components/Portfolio/EquityChart.jsx';
import EquityChartHeader from './components/Portfolio/EquityChartHeader.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [currPortfolioId, setCurrPortfolioId] = useState();
  const [equityChartData, setEquityChartData] = useState([]);
  // For purposes of charting equity curve
  const timeFrame = '1m';
  const equityChartProps = { equityChartData, timeFrame };

  const refreshPortfolioView = (event, targetPortfolioId) => {
    let portfolioId;
    if (!targetPortfolioId) {
      portfolioId = event.target.value;
    } else {
      portfolioId = targetPortfolioId;
    }
    setCurrPortfolioId(portfolioId);
    console.log(portfolioId, 'portfolioId');
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        setPortfolioStocks(result.data.essentialQuoteInfo);
        setEquityChartData(result.data.portfolioValueTimeSeries);
      })
      .catch((error) => console.log(error));
  };

  // To display the portfolio buttons and their corresponding portfolios
  const handleDisplayPortfolio = () => {
    axios.get('/portfolios')
      .then((result) => {
        if (result.data.message === 'success') {
          setPortfolioList(result.data.portfolios);
          setDisplay('portfolio');
        }
      })
      .catch((error) => console.log(error));
  };

  // To make sure username is everytime the page is reloaded
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

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList, setUsername, handleDisplayPortfolio,
  };
  const portfolioButtonsProps = {
    portfolioList,
  };
  return (
    <div className="flex-container">
      <div className="sidebar-flex">
        <SideBar sideBarProps={sideBarProps} />
      </div>
      <div className="main-display-flex">
        {display === 'main'
      && <MainDisplay />}
        {display === 'portfolio'
      && (
      <div>
        <EquityChartHeader
          portfolioId={currPortfolioId}
          handleDisplayPortfolio={handleDisplayPortfolio}
        />
        <EquityChart equityChartProps={equityChartProps} />
        <PortfolioButtonList
          portfolioButtonsProps={portfolioButtonsProps}
          refreshPortfolioView={refreshPortfolioView}
        />
        <PortfolioTable
          currPortfolioId={currPortfolioId}
          portfolioStocks={portfolioStocks}
          refreshPortfolioView={refreshPortfolioView}
        />
      </div>
      )}
      </div>
    </div>
  );
}
