import axios from 'axios';
import moment from 'moment';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

// Helper that calculates the total equity of a portfolio (1M view)
const calculatePortfolioValue = (batchQuotes, arrayOfStockTrades, selectedStockIds, selectedStockNamesString) => {
  // First convert all the spot prices into an array of objects with
  // key: symbol and value: an object of dates as key and value as price
  const newArrayOfStkSpotPrices = batchQuotes.map((entry) => {
    let datePrice = {};

    entry.chart.forEach((chartUnit) => {
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

  const collectionOfStocksTraded = Object.entries(selectedStockIds).map(([key, value]) => (
    {
      id: Number(key),
      [value]: consolStkSpotPrice[value],
    }));

  // Assigning all the stock trades into each key(stock)
  arrayOfStockTrades.forEach((stk) => {
    stk.forEach((trade) => {
      collectionOfStocksTraded.forEach((stock, index) => {
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
        const stockObj = stock[selectedStockIds[stock.id]];
        const currStockTrade = stockObj[tradeDateStr];
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
            if (!stockObj[date].hasOwnProperty('cumShares')) {
              stockObj[date].cumShares = tradedShares;
              stockObj[date].cumValue = tradedShares * stockObj[date].close;
              stockObj[date].cumCost = tradedShares * costPrice;
            } else {
              stockObj[date].cumShares += tradedShares;
              stockObj[date].cumValue = stockObj[date].cumShares * stockObj[date].close;
              stockObj[date].cumCost += tradedShares * costPrice;
            }
          });
          console.log(indexOfCurrDate, 'indexOfCurrDate');
          console.log(dateKeysToPropDataArray, 'dateKeysToPropDataArray');
          console.log(stockObj, 'stockObj');
        }
      });
    });
  });
  console.log(collectionOfStocksTraded[0], 'arrayOfStocksTraded');
  // Create an object only consolidated stock trades
  let consolStkTrades = {};
  // First delete the id of each entry
  collectionOfStocksTraded.forEach((trade) => {
    delete trade.id;
    consolStkTrades = { ...consolStkTrades, ...trade };
  });

  console.log(consolStkTrades, 'consolStkTrades');

  // Create an object only portfolioValues template
  let portfolioValueTimeSeries = {};
  batchQuotes[0].chart.forEach((log) => (portfolioValueTimeSeries = { ...portfolioValueTimeSeries, [log.date]: 0 }));
  console.log(portfolioValueTimeSeries, 'portfolioValueTimeSeries');
  // Array of relevant dates
  const timeSeries = Object.keys(portfolioValueTimeSeries);
  const symbolsInPortfolio = Object.keys(consolStkTrades);
  console.log(timeSeries, 'timeSeries');
  console.log(symbolsInPortfolio, 'symbolsInPortfolio');

  symbolsInPortfolio.forEach((symbol) => {
    timeSeries.forEach((date) => {
      if (consolStkTrades[symbol][date].hasOwnProperty('cumValue')) {
        portfolioValueTimeSeries[date] += consolStkTrades[symbol][date].cumValue;
      } else {
        portfolioValueTimeSeries[date] += 0;
      }
    });
  });

  // portfolioValueTimeSeries = Object.entries(portfolioValueTimeSeries).map([key,value]=>{return key:value})
  console.log(portfolioValueTimeSeries, 'portfolioValueTimeSeries');
  return portfolioValueTimeSeries;
  // arrayOfStkSpotPrices.forEach((stkSpotPrice) => {
  //   // console.log(stkSpotPrice, `stkSpotPrice-${index}`);
  //   stkSpotPrice.priceDates.forEach((priceDate, priceDateIndex) => {
  //     portfolioValueTimeSeries[priceDateIndex].portfolioValue += priceDate.cumValue;
  //   });
  // });

  // Calculate the total equity

  // // Calculate the total equity over the course of 1 month
  // // For 1 stock
  // // 1. collect all the prices over the course of 1 month (per day) (for all stocks)
  // // 2. collect all dates of trades in this timeframe and relevant shares
  // const arrayOfStkSpotPrices = batchQuotes.map((quote) => {
  //   const dailyPrices = quote.chart.map((dailyQuote) => ({
  //     date: dailyQuote.date,
  //     price: dailyQuote.close,
  //     cumShares: 0,
  //     cumValue: 0,
  //   }));
  //   return {
  //     symbol: quote.quote.symbol,
  //     priceDates: dailyPrices,
  //   };
  // });

  // // console.log(arrayOfStkSpotPrices, 'arrayOfStkSpotPrices');
  // // Merge price histories and dates into an object

  // // 2a.if shares exist before the date of trade, accumulate them

  // // 2b.if trades happen during the month, perform calculation on cumulative shares owned
  // // and insert into the same index as the date of the month

  // // Meld the portfolioStockId, symbol, tradeDate and tradedShares together in one obj for easy comparison
  // // against the data provided by IEX
  // const arrayOfDatesStockTraded = arrayOfStockTrades.map((stockTraded) => {
  //   // console.log(dateStockTraded, 'dateStockTraded');
  //   const dateStockTraded = stockTraded.map((trx) => {
  //     const dateString = moment(trx.tradeDate).format('YYYY-MM-DD');

  //     // if a position is sell, then we make the shares negative (for summation later)
  //     let tradedShares = trx.shares;
  //     if (trx.position === 'SELL') {
  //       tradedShares = trx.shares * -1;
  //     }
  //     const selectedArray = selectedStockIds.filter((stock) => stock.id === trx.portfolioStockId);
  //     const selected = selectedArray[0];
  //     return {
  //       portfolioStockId: selected.id,
  //       symbol: selected.symbol.toUpperCase(),
  //       tradeDate: dateString,
  //       tradedShares,
  //     };
  //   });
  //   return dateStockTraded;
  // });
  // // console.log(arrayOfStkSpotPrices, 'arrayOfStkSpotPrices');

  // // For each of the dates and spot prices of a stock generated by IEX
  // arrayOfStkSpotPrices.forEach((stkSpotPrices) => {
  //   // Compare it against the dates a stock is traded
  //   // console.log(arrayOfDatesStockTraded, 'arrayOfDatesStockTraded');
  //   arrayOfDatesStockTraded.forEach((stk) => {
  //     stk.forEach((txn) => {
  //       // if the spotprices and transaction in question are for the same symbol
  //       if (stkSpotPrices.symbol === txn.symbol) {
  //         // Mutate the given data for each stock by amending its cumulative shares owned and cumulative value
  //         stkSpotPrices.priceDates.forEach((priceDate, priceDateIndex) => {
  //           let prevCumShares;
  //           if (priceDateIndex > 0) {
  //             prevCumShares = stkSpotPrices.priceDates[priceDateIndex - 1].cumShares;
  //           } else {
  //             prevCumShares = 0;
  //           }
  //           if (priceDate.date === txn.tradeDate) {
  //             const currCumShares = prevCumShares + txn.tradedShares;
  //             const currCumValue = currCumShares * priceDate.price;
  //             stkSpotPrices.priceDates[priceDateIndex] = {
  //               ...priceDate,
  //               cumShares: currCumShares,
  //               cumValue: currCumValue,
  //             };
  //             // Propagate the number of shares forward to the next index if it is not empty
  //             // (as a data pt required for each day of plotting onto a graph)
  //           } else {
  //             stkSpotPrices.priceDates[priceDateIndex] = {
  //               ...priceDate,
  //               cumShares: prevCumShares,
  //               cumValue: prevCumShares * priceDate.price,
  //             };
  //           }
  //           // console.log(stkSpotPrices, 'stkSpotPrices');
  //         });
  //       }
  //     });
  //   });
  // });
  // // console.log(arrayOfStkSpotPrices[0], 'AMD');
  // // console.log(arrayOfStkSpotPrices[1], 'AAPL');
  // // console.log(arrayOfStkSpotPrices[2], 'MSFT');
  // // console.log(arrayOfStkSpotPrices[3], 'TSLA');
  // // 3. Combine each day's price into a value (data) point and send it to client
  // // 3a. create a template for portfolio value
  // const portfolioValueTimeSeries = arrayOfStkSpotPrices[0].priceDates.map((entry) => ({ date: entry.date, portfolioValue: 0 }));
  // // console.log(arrayOfStkSpotPrices, 'arrayOfStkSpotPrices');

  // arrayOfStkSpotPrices.forEach((stkSpotPrice) => {
  //   // console.log(stkSpotPrice, `stkSpotPrice-${index}`);
  //   stkSpotPrice.priceDates.forEach((priceDate, priceDateIndex) => {
  //     portfolioValueTimeSeries[priceDateIndex].portfolioValue += priceDate.cumValue;
  //   });
  // });
  // // console.log(portfolioValueTimeSeries, 'portfolioValueTimeSeries');
  // return portfolioValueTimeSeries;
};

const getBatchQuotes = (portfolioId, selectedStockIds, arrayOfSharesOwned, arrayOfStockTrades, selectedStockNamesString) => {
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
        const selectedPortfolioStockId = Object.keys(selectedStockIds).find((key) => selectedStockIds[key] === symbol.toLowerCase());

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
      const selectedStockNamesString = selectedStockNames.join(',');

      let selectedStockIds = {};

      selectedPortfolio.stocks.forEach((stock) => (
        selectedStockIds = { ...selectedStockIds, [stock.id]: stock.stockSymbol.toUpperCase() }
      ));

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
          return getBatchQuotes(portfolioId, selectedStockIds, arrayOfSharesOwned, arrayOfStockTrades, selectedStockNamesString);
        })
        .then((batchQuoteResults) => {
          // Calculate the portfolioValue over a time frame (fixed at 1M for now)
          const { essentialQuoteInfo, batchQuotes } = batchQuoteResults;
          const portfolioValueTimeSeries = calculatePortfolioValue(batchQuotes, arrayOfStockTrades, selectedStockIds, selectedStockNamesString);
          res.send({ essentialQuoteInfo, portfolioValueTimeSeries });
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  };

  const update = async (req, res) => {
    const { tradesData } = req.body;
    console.log(tradesData, 'tradesData');
    const updatedTradeData = tradesData.map(async (trade) => {
      const {
        portfolioStockId, position, costPrice, tradeDate, shares,
      } = trade;

      let newTrade;

      if (trade.id === null) {
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
            id: trade.id,
            portfolioStockId,
          },
        });
      }
      return newTrade;
    });

    Promise.all(updatedTradeData)
      .then((result) => {
        console.log(result, 'result');
        res.send({ message: 'newTradeCreated' });
      })
      .catch((err) => console.log(err));
  };

  return ({
    index,
    view,
    update,
  });
}
