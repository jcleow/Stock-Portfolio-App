import axios from 'axios';
import moment from 'moment';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

// Function that continuously accumulates share holdings from start to end of timeSeries
const accSharesValueCost = (stockObj, date, tradedShares, costPrice) => {
  if (!stockObj[date].hasOwnProperty('cumShares')) {
    stockObj[date].cumShares = tradedShares;
    stockObj[date].cumValue = tradedShares * stockObj[date].close;
    stockObj[date].cumCost = tradedShares * costPrice;
  } else {
    stockObj[date].cumShares += tradedShares;
    stockObj[date].cumValue = stockObj[date].cumShares * stockObj[date].close;
    stockObj[date].cumCost += tradedShares * costPrice;
  }
};

// Function that calculates the total equity of a portfolio (1M view)
export const calcPortfolioValueAndCost = (batchQuotes, arrayOfStockTrades, selectedPortfolioStockIds) => {
  let storeFirstDateStr;

  // First convert all the spot prices into an array of objects with
  // key: symbol and value: an object of dates as key and value as price
  const newArrayOfStkSpotPrices = batchQuotes.map((entry) => {
    let datePrice = {};

    entry.chart.forEach((chartUnit, index) => {
      if (index === 0) {
        storeFirstDateStr = chartUnit.date;
      }
      datePrice = { ...datePrice, [chartUnit.date]: { close: chartUnit.close } };
    });

    const revisedEntry = {
      [entry.quote.symbol]: datePrice,
    };
    return revisedEntry;
  });

  // Consolidated stock date(key) and spot price (value)
  let consolStkSpotPrice = {};
  newArrayOfStkSpotPrices.forEach((entry) => {
    consolStkSpotPrice = { ...consolStkSpotPrice, ...entry };
  });

  const collectionOfStocksTraded = Object.entries(selectedPortfolioStockIds).map(([key, value]) => (
    // id here refers to portfolioStockId
    {
      id: value,
      [key]: consolStkSpotPrice[key],
    }));

  // Assigning all the stock trades into each key(stock)

  arrayOfStockTrades.forEach((stk) => {
    stk.forEach((trade) => {
      collectionOfStocksTraded.forEach((stock) => {
        const {
          tradeDate, portfolioStockId, position, costPrice, shares,
        } = trade;

        let tradedShares;
        if (position === 'SELL') {
          tradedShares = Number(shares) * -1;
        } else {
          tradedShares = shares;
        }
        const tradeDateStr = moment(tradeDate).format('YYYY-MM-DD');
        // stock.id here refers to portfolioStockId and we are trying to find the right portfolio stock through its value

        const symb = Object.keys(selectedPortfolioStockIds).filter((key) => selectedPortfolioStockIds[key] === stock.id);
        const stockObj = stock[symb];
        // somewhere heere
        const currStockTrade = stockObj[tradeDateStr];
        if (currStockTrade) {
          // If current portfolioStockId of this trade is same as the portfolioStock in the CollectionOfStocksTraded
          if (stock.id === portfolioStockId) {
            if (!currStockTrade.hasOwnProperty('tradedShares') && !currStockTrade.hasOwnProperty('totalCost')) {
              currStockTrade.tradedShares = tradedShares;
              currStockTrade.totalCost = tradedShares * costPrice;
            } else {
              currStockTrade.tradedShares += tradedShares;
              currStockTrade.totalCost += tradedShares * costPrice;
            }

            const indexOfCurrDate = Object.keys(stockObj).findIndex((el) => el === tradeDateStr);
            // Propagate the cumulative shares, cost and value forward to the other dates
            const dateKeysToPropDataArray = Object.keys(stockObj).slice(indexOfCurrDate);
            dateKeysToPropDataArray.forEach((date) => {
              accSharesValueCost(stockObj, date, tradedShares, costPrice);
            });
          }
          // else if this tradeDate is not in the timeSeriesView of the portfolio...
        } else if (stock.id === portfolioStockId) {
          accSharesValueCost(stockObj, storeFirstDateStr, tradedShares, costPrice);

          const indexOfCurrDate = Object.keys(stockObj).findIndex((el) => el === tradeDateStr);
          // Propagate the cumulative shares, cost and value forward to the other dates
          const dateKeysToPropDataArray = Object.keys(stockObj).slice(indexOfCurrDate + 1);
          dateKeysToPropDataArray.forEach((date) => {
            if (!stockObj[date].hasOwnProperty('cumShares')) {
              stockObj[date].cumShares = stockObj[storeFirstDateStr].cumShares;
              stockObj[date].cumValue = stockObj[storeFirstDateStr].cumShares * stockObj[date].close;
              stockObj[date].cumCost = stockObj[storeFirstDateStr].cumShares * costPrice;
            }
          });
        }
      });
    });
  });

  // Create an object only consolidated stock trades
  let consolStkTrades = {};
  // First delete the id of each entry
  collectionOfStocksTraded.forEach((trade) => {
    delete trade.id;
    consolStkTrades = { ...consolStkTrades, ...trade };
  });

  // Create an object only portfolioValues template
  let portfolioValueTimeSeries = {};
  batchQuotes[0].chart.forEach((log) => (portfolioValueTimeSeries = { ...portfolioValueTimeSeries, [log.date]: 0 }));
  const accumulatedCostTimeSeries = { ...portfolioValueTimeSeries };

  // Array of relevant dates
  const timeSeries = Object.keys(portfolioValueTimeSeries);
  const symbolsInPortfolio = Object.keys(consolStkTrades);

  symbolsInPortfolio.forEach((symbol) => {
    timeSeries.forEach((date) => {
      if (consolStkTrades[symbol][date].hasOwnProperty('cumValue')) {
        // This is if stk trade coincided with the time range viewed by user
        portfolioValueTimeSeries[date] += consolStkTrades[symbol][date].cumValue;
        accumulatedCostTimeSeries[date] += consolStkTrades[symbol][date].cumCost;
      } else {
        portfolioValueTimeSeries[date] += 0;
        accumulatedCostTimeSeries[date] += 0;
      }
    });
  });
  return { portfolioValueTimeSeries, accumulatedCostTimeSeries };
};

// Function that obtains quotes of multiple symbols together
export const getBatchQuotes = (portfolioId, selectedPortfolioStockIds, arrayOfSharesOwned, arrayOfStockTrades, selectedStockNamesString) => {
  let batchQuotes;
  let essentialQuoteInfo;
  // axios.get...then( ) returns a Promise that will resolve to the return value
  return axios.get(`${GENERICURL}/market/batch?symbols=${selectedStockNamesString}&types=quote,chart&range=1m&token=${SANDBOXTOKEN}`)
    .then((batchResults) => {
      batchQuotes = Object.values(batchResults.data);
      // Destructure the information from API call
      essentialQuoteInfo = batchQuotes.map((stock, stockIndex) => {
        // Must get the last closing price in the batch quotes as the other 'close' attr does not tie
        const { close } = batchQuotes[stockIndex].chart[batchQuotes[stockIndex].chart.length - 1];
        const {
          symbol, companyName, change, changePercent, avgTotalVolume, marketCap,
        } = stock.quote;
        // Search for the appropriate portfolio_stock_id to append to stockInfoObj
        const selectedPortfolioStockId = selectedPortfolioStockIds[symbol];
        const stockInfoObj = {
          portfolioId,
          portfolioStockId: selectedPortfolioStockId,
          symbol,
          companyName,
          close,
          change,
          changePercent,
          avgTotalVolume,
          marketCap,
          trades: arrayOfStockTrades[stockIndex],
          totalSharesOwned: arrayOfSharesOwned[stockIndex],
        };
        return stockInfoObj;
      });
      // Promise.Resolved value
      return { batchQuotes, essentialQuoteInfo };
    })
    .catch((err) => console.log(err));
};
