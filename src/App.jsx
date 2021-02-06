import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioTable from './components/Portfolio/PortfolioTable.jsx';
import SideBar from './components/SideBar/SideBar.jsx';
import StockSearch from './components/StockSearch.jsx';
import EquityChart from './components/Portfolio/EquityChart.jsx';
import EquityChartHeader from './components/Portfolio/EquityChartHeader.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Manage state of either portfolio view or stock search view
  const [display, setDisplay] = useState('portfolio');

  // ********* Manage states for  Portfolio View *************//
  // Manage states of current list of portfolios belonging to curr user
  const [portfolioList, setPortfolioList] = useState([]);

  // Manage states of all the stocks in the curr portfolio user is viewing
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [currPortfolioId, setCurrPortfolioId] = useState();
  console.log(currPortfolioId, 'currPortfolioId');

  // Manage data for current portfolio user is viewing
  const [equityCurveData, setEquityCurveData] = useState([]);
  const [accCostCurveData, setAccCostCurveData] = useState([]);
  const [selectedPortfolioName, setSelectedPortfolioName] = useState();

  // ********* Manage states for  Stock Search View **********//
  // Track the price quote data for the stock search price chart
  const [quoteData, setQuoteData] = useState([]);
  const [duration, setDuration] = useState('');
  // Track the keystats of currently selected symbol
  const [keyStats, setKeyStats] = useState(null);
  // Track the coyInfoData
  const [coyInfo, setCoyInfo] = useState([]);
  // Track the currently selected symbol
  const [symbol, setSymbol] = useState('');

  // For purposes of charting initial display of first (and all) portfolio equity curve
  const timeFrame = '1m';

  const refreshPortfolioView = (event, targetPortfolioId) => {
    let portfolioId;
    if (!targetPortfolioId) {
      portfolioId = event.target.value;
    } else {
      portfolioId = targetPortfolioId;
    }
    setCurrPortfolioId(portfolioId);
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

  // Get default AAPL 1M chart when opening up stock search
  function handleGetDefaultChart() {
    let coyInfoData;
    axios.get('/aapl/headlineInfo')
      .then((result) => {
        setSymbol('aapl');
        coyInfoData = result.data;
        return axios.get('/aapl/chart/1m');
      })
      .then((chartDataResult) => {
        // Due to IEX inconsistent prices with the chart we have to
        // Remedy the latest closing price
        setCoyInfo({ ...coyInfoData, close: chartDataResult.data.coordinates.slice(-1)[0].close });
        setQuoteData(chartDataResult.data.coordinates);
        setDuration(chartDataResult.data.duration);
        return axios.get('/aapl/stats/');
      })
      .then((statsResults) => {
        setKeyStats(statsResults.data);
      })
      .catch((error) => console.log(error));
  }

  // To make sure username is everytime the page is reloaded
  useEffect(() => {
    if (document.cookie) {
      setLoggedIn(true);
      const splitCookieVal = document.cookie.split(' ');
      const startPos = splitCookieVal[0].indexOf('=') + 1;
      const endPos = splitCookieVal[0].indexOf(';');
      const loggedInUsername = splitCookieVal[0].substring(startPos, endPos);
      setUsername(loggedInUsername);
      // Display the available portfolios in sidebar and on main screen once page loads
      handleDisplayPortfolio();

      // *** buggy // Set currPortfolioId... to first portfolio upon refresh? ** buggy

      // Display the default portfolio on render to be default to 1M view
      handleGetDefaultChart();
    }
  }, []);
  const equityChartProps = {
    equityCurveData, accCostCurveData, timeFrame,
  };

  const sideBarProps = {
    username,
    loggedIn,
    portfolioList,

    setLoggedIn,
    setDisplay,
    setPortfolioList,
    setUsername,

    setSelectedPortfolioName,
    handleDisplayPortfolio,
    refreshPortfolioView,
    handleGetDefaultChart,
  };

  const equityChartHeaderProps = {
    selectedPortfolioName,
    equityCurveData,
    accCostCurveData,
    currPortfolioId,
  };

  const stockSearchProps = {
    quoteData,
    duration,
    keyStats,
    symbol,
    coyInfo,
    setQuoteData,
    setDuration,
    setKeyStats,
    setSymbol,
    setCoyInfo,
  };

  return (
    <div className="flex-container">
      <div className="sidebar-flex">
        <SideBar sideBarProps={sideBarProps} />
      </div>
      <div className="main-display-flex">
        {display === 'stockSearch'
      && <StockSearch stockSearchProps={stockSearchProps} />}
        {display === 'portfolio'
      && (
      <div>
        <EquityChartHeader
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
