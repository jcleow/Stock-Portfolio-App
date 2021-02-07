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

  // Track the loading animation of stock search
  // Storing as an object does not work in one render for different components
  // const [loadingStock, setLoadingStock] = useState(defaultLoadingStock);
  const [loadingCoyInfo, setLoadingCoyInfo] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingKeyStats, setLoadingKeyStats] = useState(true);

  // Track the loading animation for disabling the loading of adding a new symbol button
  const [loadingNewSymbol, setLoadingNewSymbol] = useState(false);

  // For purposes of charting initial display of first (and all) portfolio equity curve
  const timeFrame = '1m';

  const getInfoFromCookie = () => {
    if (document.cookie) {
      const splitCookieVal = document.cookie.split(' ');
      const usernameStartPos = splitCookieVal[0].indexOf('=') + 1;
      const usernameEndPos = splitCookieVal[0].indexOf(';');
      const loggedInUsername = splitCookieVal[0].substring(usernameStartPos, usernameEndPos);
      const idStartPos = splitCookieVal[3].indexOf('=') + 1;
      const trackedPortfolioId = Number(splitCookieVal[3].substring(idStartPos));
      return ({ loggedInUsername, trackedPortfolioId });
    }
    return null;
  };

  const refreshPortfolioView = (event, targetPortfolioId) => {
    let portfolioId;
    if (!targetPortfolioId) {
      portfolioId = event.target.value;
    } else {
      portfolioId = targetPortfolioId;
    }
    setLoadingNewSymbol(true);
    setCurrPortfolioId(portfolioId);
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        setPortfolioStocks(result.data.essentialQuoteInfo);
        setEquityCurveData(result.data.portfolioValueTimeSeries);
        setAccCostCurveData(result.data.accumulatedCostTimeSeries);
        setLoadingNewSymbol(false);
      })
      .catch((error) => console.log(error));
  };

  // To display the portfolio buttons and their corresponding portfolios
  const handleDisplayPortfolio = () => {
    setLoadingNewSymbol(true);
    axios.get('/portfolios')
      .then((result) => {
        if (result.data.message === 'success') {
          setPortfolioList(result.data.portfolios);
          setDisplay('portfolio');
        }

        const { trackedPortfolioId } = getInfoFromCookie();

        if (!Number.isNaN(trackedPortfolioId)) {
          const lastViewedIndex = result.data.portfolios.findIndex(
            (portfolio) => portfolio.id === Number(trackedPortfolioId),
          );
          setSelectedPortfolioName(result.data.portfolios[lastViewedIndex].name);
          return axios.get(`/portfolios/${trackedPortfolioId}`);
        }

        if (result.data.portfolios.length > 0) {
          setSelectedPortfolioName(result.data.portfolios[0].name);
          setCurrPortfolioId(Number(result.data.portfolios[0].id));
          return axios.get(`/portfolios/${result.data.portfolios[0].id}`);
        }
        setSelectedPortfolioName('Please create a portfolio to begin');
      })
      .then((firstPortfolioResult) => {
        if (firstPortfolioResult) {
          setPortfolioStocks(firstPortfolioResult.data.essentialQuoteInfo);
          setEquityCurveData(firstPortfolioResult.data.portfolioValueTimeSeries);
          setAccCostCurveData(firstPortfolioResult.data.accumulatedCostTimeSeries);
          setLoadingNewSymbol(false);
        }
      })
      .catch((error) => console.log(error));
  };

  // Get default AAPL 1M chart when opening up stock search
  function handleGetDefaultChart() {
    console.log('getting default aapl chart');
    let coyInfoData;

    axios.get('/aapl/headlineInfo')
      .then((result) => {
        setSymbol('aapl');
        coyInfoData = result.data;
        setLoadingCoyInfo(false);
        return axios.get('/aapl/chart/1m');
      })
      .then((chartDataResult) => {
        // Due to IEX inconsistent prices with the chart we have to
        // Remedy the latest closing price
        setCoyInfo({ ...coyInfoData, close: chartDataResult.data.coordinates.slice(-1)[0].close });
        setQuoteData(chartDataResult.data.coordinates);
        setDuration(chartDataResult.data.duration);
        setLoadingChart(false);
        return axios.get('/aapl/stats/');
      })
      .then((statsResults) => {
        setKeyStats(statsResults.data);
        setLoadingKeyStats(false);
      })
      .catch((error) => console.log(error));
  }

  // To make sure username is everytime the page is reloaded
  useEffect(() => {
    if (document.cookie) {
      setLoggedIn(true);
      const userCookieInfo = getInfoFromCookie();
      const { loggedInUsername, trackedPortfolioId } = userCookieInfo;
      setUsername(loggedInUsername);
      // Store the last viewed portfolio if user decides to refresh the page
      console.log(trackedPortfolioId, 'trackedPortfolioId');
      if (!Number.isNaN(trackedPortfolioId)) {
        setCurrPortfolioId(trackedPortfolioId);
      }
    }
    // Display the available portfolios in sidebar and on main screen once page loads
    handleDisplayPortfolio();
    // Display the default stock search on render to be default to 1M view
    handleGetDefaultChart();
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
    loadingCoyInfo,
    loadingChart,
    loadingKeyStats,
    setQuoteData,
    setDuration,
    setKeyStats,
    setSymbol,
    setCoyInfo,
    setLoadingCoyInfo,
    setLoadingChart,
    setLoadingKeyStats,
  };

  const addSymbLoadingProps = { loadingNewSymbol, setLoadingNewSymbol };

  return (
    <div className="flex-container">
      <div className="sidebar-flex">
        <SideBar sideBarProps={sideBarProps} />
      </div>
      <div className="main-display-flex">
        {display === 'stockSearch' || Number.isNaN(currPortfolioId) || currPortfolioId === undefined
          ? <StockSearch stockSearchProps={stockSearchProps} /> : null}
        {display === 'portfolio' && !Number.isNaN(currPortfolioId) && currPortfolioId !== undefined
          ? (
            <div>
              <EquityChartHeader
                equityChartHeaderProps={equityChartHeaderProps}
              />
              <EquityChart equityChartProps={equityChartProps} />
              <PortfolioTable
                currPortfolioId={currPortfolioId}
                portfolioStocks={portfolioStocks}
                refreshPortfolioView={refreshPortfolioView}
                addSymbLoadingProps={addSymbLoadingProps}
              />
            </div>
          ) : () => { setDisplay('stockSearch'); }}
      </div>
    </div>
  );
}
