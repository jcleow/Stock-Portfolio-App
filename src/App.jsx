import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getInfoFromCookie, { handleDisplayPortfolio, getPastMarketHolidays }
  from './AppHelper.jsx';
import PortfolioTable from './components/Portfolio/PortfolioTable.jsx';
import SideBar from './components/SideBar/SideBar.jsx';
import StockSearch from './components/StockSearch/StockSearch.jsx';
import EquityChart from './components/Portfolio/EquityChart.jsx';
import EquityChartHeader from './components/Portfolio/EquityChartHeader.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [holidays, setHolidays] = useState([]);

  // Manage state of either portfolio view or stock search view
  const [display, setDisplay] = useState('portfolio');

  // ********* Manage states for  Portfolio View *************//
  // Manage states of current list of portfolios belonging to curr user
  const [portfolioList, setPortfolioList] = useState([]);

  // Manage states of all the stocks in the curr portfolio user is viewing
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [currPortfolioId, setCurrPortfolioId] = useState();

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

  // Track the current input symbol in stockSearch
  const [symbolInput, setSymbolInput] = useState('');

  // Track the loading animation of stock search
  // Storing as an object does not work in one render for different components
  const [loadingCoyInfo, setLoadingCoyInfo] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingKeyStats, setLoadingKeyStats] = useState(true);

  // Track the loading animation for disabling the loading of adding a new symbol button
  const [loadingNewSymbol, setLoadingNewSymbol] = useState(false);

  // For purposes of charting initial display of first (and all) portfolio equity curve
  const timeFrame = '1m';

  // Reloads the portfolio view (graph and table) when a change is made
  // function used across various nested components
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

  const handleDisplayPortfolioParams = {
    setLoadingNewSymbol,
    setPortfolioList,
    setDisplay,
    setSelectedPortfolioName,
    setCurrPortfolioId,
    setPortfolioStocks,
    setEquityCurveData,
    setAccCostCurveData,
  };

  /** Function that retrieves chart
   * used across multiple nested components
   * @param {String} timePeriod
   * @param {String} userInputSymbol
   * @param {Boolean} defaultView
   */

  function handleGetChart(timePeriod, userInputSymbol, defaultView) {
    let coyInfoData;
    setLoadingCoyInfo(true);
    setLoadingChart(true);
    setLoadingKeyStats(true);
    let selectedSymbol = userInputSymbol;
    if (!userInputSymbol) {
      selectedSymbol = symbol;
    }

    axios.get(`/${selectedSymbol}/headlineInfo`)
      .then((result) => {
        if (result.data.error) {
          alert('You have not entered a valid symbol. Please try again');
          setSymbolInput('');
          // Default to AAPL 1m chart
          handleGetChart('1m', 'aapl', true);
          return;
        }
        setSymbol(result.data.symbol);
        coyInfoData = result.data;
        return axios.get(`/${selectedSymbol}/chart/${timePeriod}`);
      })
      .then((chartDataResult) => {
        // Due to IEX inconsistent prices with the chart we have to
        // Remedy the latest closing price,change & change pct
        const revisedCurrClosePrice = chartDataResult.data.coordinates.slice(-1)[0].close;
        const revisedLastClosePrice = chartDataResult.data.coordinates.slice(-2, -1)[0].close;
        const revisedChange = revisedCurrClosePrice - revisedLastClosePrice;
        const revisedChangePct = (revisedChange / revisedLastClosePrice) * 100;

        setCoyInfo({
          ...coyInfoData,
          close: revisedCurrClosePrice,
          change: revisedChange,
          changePercent: revisedChangePct,
        });
        setQuoteData(chartDataResult.data.coordinates);
        setDuration(chartDataResult.data.duration);
        setLoadingCoyInfo(false);
        setLoadingChart(false);
        return axios.get(`/${selectedSymbol}/stats/`);
      })
      .then((statsResults) => {
        setKeyStats(statsResults.data);
        if (!defaultView) {
          setSymbolInput('');
        }
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
      if (!Number.isNaN(trackedPortfolioId)) {
        setCurrPortfolioId(trackedPortfolioId);
      }
    }
    // Display the available portfolios in sidebar and on main screen once page loads
    handleDisplayPortfolio(handleDisplayPortfolioParams);
    // Display the default stock search on render to be default to 1M view of AAPL
    if (symbol === '') {
      handleGetChart('1m', 'aapl', true);
    }
    getPastMarketHolidays(setHolidays);
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
    handleGetChart,
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
    coyInfo,
    loadingCoyInfo,
    loadingChart,
    loadingKeyStats,
    handleGetChart,
    symbolInput,
    setSymbolInput,
  };

  const addSymbLoadingProps = { loadingNewSymbol, setLoadingNewSymbol };

  return (
    <div className="flex-container">
      <div className="sidebar-flex">
        <SideBar sideBarProps={sideBarProps} />
      </div>
      <div className="main-display-flex">
        {(display === 'stockSearch' || Number.isNaN(currPortfolioId) || currPortfolioId === undefined)
          && <StockSearch stockSearchProps={stockSearchProps} />}
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
                holidays={holidays}
              />
            </div>
          ) : () => { setDisplay('stockSearch'); }}
      </div>
    </div>
  );
}
