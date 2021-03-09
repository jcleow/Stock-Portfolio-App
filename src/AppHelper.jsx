import axios from 'axios';

export default function getInfoFromCookie() {
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
}

// To display the portfolio buttons and their corresponding portfolios
export const handleDisplayPortfolio = ({
  setLoadingNewSymbol,
  setPortfolioList,
  setDisplay,
  setSelectedPortfolioName,
  setCurrPortfolioId,
  setPortfolioStocks,
  setEquityCurveData,
  setAccCostCurveData,
}) => {
  setLoadingNewSymbol(true);
  axios.get('/portfolios')
    .then((result) => {
      if (result.data.message === 'success') {
        setPortfolioList(result.data.portfolios);
        setDisplay('portfolio');
      }

      const allCookieInfo = getInfoFromCookie();
      let trackedPortfolioId;
      if (allCookieInfo) {
        trackedPortfolioId = allCookieInfo.trackedPortfolioId;
      }
      if (trackedPortfolioId) {
        if (!Number.isNaN(trackedPortfolioId)) {
          const lastViewedIndex = result.data.portfolios.findIndex(
            (portfolio) => portfolio.id === Number(trackedPortfolioId),
          );
          setSelectedPortfolioName(result.data.portfolios[lastViewedIndex].name);
          return axios.get(`/portfolios/${trackedPortfolioId}`);
        }
      }

      if (result.data.portfolios && result.data.portfolios.length > 0) {
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

// Get all the holidays in the past 50 days starting from today
export const getPastMarketHolidays = (setHolidays) => {
  axios.get('/holidays')
    .then((result) => {
      setHolidays(result.data.holidays);
    })
    .catch((error) => console.log(error));
};
