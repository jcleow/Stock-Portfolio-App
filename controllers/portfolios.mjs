import axios from 'axios';
import moment from 'moment';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

// Helper that accumulates and propagates share holdings from start to end of timeSeries
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

// Helper that calculates the total equity of a portfolio (1M view)
const calcPortfolioValueAndCost = (batchQuotes, arrayOfStockTrades, selectedPortfolioStockIds) => {
  let storeFirstDateStr;

  // First convert all the spot prices into an array of objects with
  // key: symbol and value: an object of dates as key and value as price
  const newArrayOfStkSpotPrices = batchQuotes.map((entry) => {
    let datePrice = {};

    entry.chart.forEach((chartUnit, index) => {
      if (index === 0) {
        storeFirstDateStr = chartUnit.date;
        console.log(storeFirstDateStr, 'storeFirstDateStr');
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

const getBatchQuotes = (portfolioId, selectedPortfolioStockIds, arrayOfSharesOwned, arrayOfStockTrades, selectedStockNamesString) => {
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

export default function portfolios(db) {
  const index = async (req, res) => {
    if (req.middlewareLoggedIn) {
      const { loggedInUserId } = req.cookies;
      const loggedInUser = await db.User.findByPk(loggedInUserId);
      const arrayOfPortfolios = await loggedInUser.getPortfolios();
      res.send({ message: 'success', portfolios: arrayOfPortfolios });
      return;
    }
    res.send({ message: 'not logged in' });
  };

  const view = async (req, res) => {
    const { portfolioId } = req.params;
    try {
      const selectedPortfolio = await db.Portfolio.findByPk(portfolioId, {
        include: db.Stock,
      });

      // Retrieve individual stock symbols
      const selectedStockNames = selectedPortfolio.stocks.map((stock) => stock.stockSymbol);

      // if stocks list is zero, exit the function
      if (selectedStockNames.length === 0) {
        res.send({ message: 'no stocks added' });
        return;
      }
      const selectedStockNamesString = selectedStockNames.join(',');
      let selectedStockIds = {};
      let selectedPortfolioStockIds = {};

      selectedPortfolio.stocks.forEach((stock) => {
        selectedStockIds = { ...selectedStockIds, [stock.id]: stock.stockSymbol.toUpperCase() };
        selectedPortfolioStockIds = { ...selectedPortfolioStockIds, [stock.stockSymbol.toUpperCase()]: stock.portfolio_stock.id };
      });

      // Retrieve individual stock trades
      const selectedPortfolioStocks = await db.PortfolioStock.findAll({ where: { portfolioId } });
      const allTradesPromises = selectedPortfolioStocks.map(async (stock) => {
        const stockTrades = await stock.getTrades();
        return stockTrades;
      });
      // Retrieve individual stock trades and cumulative share holdings
      let arrayOfStockTrades;
      let arrayOfSharesOwned;
      Promise.all(allTradesPromises)
        .then((result) => {
          arrayOfStockTrades = result;
          // Retrieve total shares owned in each stock
          arrayOfSharesOwned = arrayOfStockTrades.map((trade) => {
            const sharesPerStock = trade.reduce((acc, currTrade) => {
              if (currTrade.position === 'SELL') {
                return acc - currTrade.shares;
              }
              return acc + currTrade.shares;
            }, 0);
            return sharesPerStock;
          });
          // getBatchQuotes is a promise
          return getBatchQuotes(portfolioId, selectedPortfolioStockIds, arrayOfSharesOwned, arrayOfStockTrades, selectedStockNamesString);
        })
        .then((batchQuoteResults) => {
          // Calculate the portfolioValue over a time frame (fixed at 1M for now)
          const { essentialQuoteInfo, batchQuotes } = batchQuoteResults;
          const { portfolioValueTimeSeries, accumulatedCostTimeSeries } = calcPortfolioValueAndCost(batchQuotes, arrayOfStockTrades, selectedPortfolioStockIds, selectedStockNamesString);
          res.send({ essentialQuoteInfo, portfolioValueTimeSeries, accumulatedCostTimeSeries });
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  };

  // Update the trade details of a portfolioStock
  const update = async (req, res) => {
    const { tradesData } = req.body;
    const updatedTradeData = tradesData.map(async (trade) => {
      const {
        id, portfolioStockId, position, costPrice, tradeDate, shares,
      } = trade;

      let newTrade;

      if (id === null) {
        newTrade = await db.Trade.create({
          portfolioStockId, position, costPrice, tradeDate, shares,
        });
      } else {
        newTrade = await db.Trade.update({
          portfolioStockId,
          position,
          costPrice,
          tradeDate,
          shares,
        }, {
          where: {
            id,
            portfolioStockId,
          },
        });
      }
      return newTrade;
    });

    Promise.all(updatedTradeData)
      .then((result) => {
        res.send({ message: 'newTradeCreated' });
      })
      .catch((err) => console.log(err));
  };

  const create = async (req, res) => {
    const { portfolioName } = req.body;
    await db.Portfolio.create({
      userId: req.loggedInUserId,
      name: portfolioName,
    });
    res.send({ message: 'completed' });
  };

  // Add a symbol to a portfolio
  const add = async (req, res) => {
    const { newSymbol } = req.body;
    const { portfolioId } = req.params;

    // first find if this stock exists, if not create a new one
    const stockToBeAdded = await db.Stock.findOne({
      where:
    {
      stockSymbol: newSymbol,
    },
    });

    if (!stockToBeAdded) {
      axios.get(`${GENERICURL}/${newSymbol}/quote?token=${SANDBOXTOKEN}`)
        .then((result) => db.Stock.create({
          stockName: result.data.companyName,
          stockSymbol: newSymbol.toLowerCase(),
        }))
        .then((stockCreated) => db.PortfolioStock.create({
          portfolioId: Number(portfolioId),
          stockId: stockCreated.id,
        }))
        .then((createNewPortfolioStockResult) => {
          console.log(createNewPortfolioStockResult, 'createNewPortfolioStockResult');
          // To pass the newly created symbol back
          res.send({ message: 'completed' });
        })
        .catch((err) => {
          console.log(err);
          res.send({ message: 'failure', err });
        });
    }
  };

  const deletePortfolio = async (req, res) => {
    const { portfolioId } = req.params;
    await db.Portfolio.destroy({
      where: {
        id: portfolioId,
      },
    });
    res.send({ message: 'portfolio deleted' });
  };

  const deletePortfolioStock = async (req, res) => {
    const { portfolioStockId } = req.params;
    await db.PortfolioStock.destroy({
      where: {
        id: portfolioStockId,
      },
    });
    res.send({ message: `portfolioStockId ${portfolioStockId} has been deleted` });
  };

  return ({
    index,
    view,
    update,
    create,
    add,
    deletePortfolio,
    deletePortfolioStock,
  });
}
