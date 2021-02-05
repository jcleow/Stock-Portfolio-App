import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [equityCurveData, setEquityCurveData] = useState([]);
  const [accCostCurveData, setAccCostCurveData] = useState([]);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState();

  // For purposes of charting equity curve
  const timeFrame = '1m';
  const equityChartProps = { equityCurveData, accCostCurveData, timeFrame };

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
        console.log(result, 'result');
        setPortfolioStocks(result.data.essentialQuoteInfo);
        setEquityCurveData(result.data.portfolioValueTimeSeries);
        setAccCostCurveData(result.data.accumulatedCostTimeSeries);
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
        if (result.data.portfolios.length > 0) {
          setSelectedPortfolioName(result.data.portfolios[0].name);
          return axios.get(`/portfolios/${result.data.portfolios[0].id}`);
        }
        setSelectedPortfolioName('Please create a portfolio to begin');
      })
      .then((firstPortfolioResult) => {
        if (firstPortfolioResult) {
          setPortfolioStocks(firstPortfolioResult.data.essentialQuoteInfo);
          setEquityCurveData(firstPortfolioResult.data.portfolioValueTimeSeries);
          setAccCostCurveData(firstPortfolioResult.data.accumulatedCostTimeSeries);
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
    username,
    loggedIn,
    setLoggedIn,
    setDisplay,
    setPortfolioList,
    setUsername,
    setSelectedPortfolioName,
    handleDisplayPortfolio,
    refreshPortfolioView,
    portfolioList,

  };

  const equityChartHeaderProps = {
    handleDisplayPortfolio,
    selectedPortfolioName,
    equityCurveData,
    accCostCurveData,
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
          equityChartHeaderProps={equityChartHeaderProps}
        />
        <EquityChart equityChartProps={equityChartProps} />
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
