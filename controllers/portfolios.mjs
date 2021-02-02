import axios from 'axios';
import moment from 'moment';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

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
      const selectedStockIds = selectedPortfolio.stocks.map((stock) => ({ id: stock.id, symbol: stock.stockSymbol }));

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
          console.log(result[0], 'result0');

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
          console.log(arrayOfSharesOwned, 'arrayofSharesOwned');
        })
        .catch((err) => console.log(err));

      // get current snapshot of stock data in batch
      axios.get(`${GENERICURL}/market/batch?symbols=${selectedStockNamesString}&types=quote,chart&range=1m&token=${SANDBOXTOKEN}`)
        .then((batchResults) => {
          const batchQuotes = Object.values(batchResults.data);
          // Destructure the information from API call
          const essentialQuoteInfo = batchQuotes.map((stock, stockIndex) => {
            const {
              symbol, companyName, latestPrice, change, changePercent, avgTotalVolume, marketCap,
            } = stock.quote;
            // Search for the appropriate portfolio_stock_id to append to stockInfoObj
            const selectedPortfolioStock = selectedStockIds.find((stock) => stock.symbol === symbol.toLowerCase());

            const stockInfoObj = {
              portfolioId,
              portfolioStockId: selectedPortfolioStock.id,
              symbol,
              companyName,
              latestPrice,
              change,
              changePercent,
              avgTotalVolume,
              marketCap,
              trades: arrayOfStockTrades[stockIndex],
              totalSharesOwned: arrayOfSharesOwned[stockIndex],
            };
            return stockInfoObj;
          });

          // Calculate the total equity over the course of 1 month
          // For 1 stock
          // 1. collect all the prices over the course of 1 month (per day) (for all stocks)
          // 2. collect all dates of trades in this timeframe and relevant shares
          const arrayOfStkSpotPrices = batchQuotes.map((quote) => {
            const dailyPrices = quote.chart.map((dailyQuote) => ({
              date: dailyQuote.date,
              price: dailyQuote.close,
              cumShares: 0,
              cumValue: 0,
            }));
            return {
              symbol: quote.quote.symbol,
              priceDates: dailyPrices,
            };
          });
          // Merge price histories and dates into an object

          // 2a.if shares exist before the date of trade, accumulate them

          // 2b.if trades happen during the month, perform calculation on cumulative shares owned
          // and insert into the same index as the date of the month

          // Meld the portfolioStockId, symbol, tradeDate and tradedShares together in one obj for easy comparison
          // against the data provided by IEX
          const arrayOfDatesStockTraded = arrayOfStockTrades.map((stockTraded) => {
            const dateStockTraded = stockTraded.map((trx) => {
              const dateString = moment(trx.tradeDate).format('YYYY-MM-DD');

              // if a position is sell, then we make the shares negative (for summation later)
              let tradedShares = trx.shares;
              if (trx.position === 'SELL') {
                tradedShares = trx.shares * -1;
              }
              const selectedArray = selectedStockIds.filter((stock) => stock.id === trx.portfolioStockId);
              const selected = selectedArray[0];
              return {
                portfolioStockId: selected.id,
                symbol: selected.symbol.toUpperCase(),
                tradeDate: dateString,
                tradedShares,
              };
            });
            return dateStockTraded;
          });
          console.log(arrayOfDatesStockTraded, 'arrayOfDateStockTraded');

          // For each of the dates and spot prices of a stock generated by IEX
          arrayOfStkSpotPrices.forEach((stkSpotPrices) => {
            // Compare it against the dates a stock is traded
            arrayOfDatesStockTraded.forEach((stk) => {
              stk.forEach((txn) => {
                // if the spotprices and transaction in question are for the same symbol
                if (stkSpotPrices.symbol === txn.symbol) {
                  // Mutate the given data for each stock by amending its cumulative shares owned and cumulative value
                  stkSpotPrices.priceDates.forEach((priceDate, priceDateIndex) => {
                    let prevCumShares;
                    if (priceDateIndex > 0) {
                      prevCumShares = stkSpotPrices.priceDates[priceDateIndex - 1].cumShares;
                    } else {
                      prevCumShares = 0;
                    }
                    if (priceDate.date === txn.tradeDate) {
                      const currCumShares = prevCumShares + txn.tradedShares;
                      const currCumValue = currCumShares * priceDate.price;
                      stkSpotPrices.priceDates[priceDateIndex] = {
                        ...priceDate,
                        cumShares: currCumShares,
                        cumValue: currCumValue,
                      };
                      // Propagate the number of shares forward to the next index if it is not empty
                      // (as a data pt required for each day of plotting onto a graph)
                    } else {
                      stkSpotPrices.priceDates[priceDateIndex] = {
                        ...priceDate,
                        cumShares: prevCumShares,
                        cumValue: prevCumShares * priceDate.price,
                      };
                    }
                  });
                }
              });
            });
          });
          console.log(arrayOfDatesStockTraded, 'altered');
          console.log(arrayOfStkSpotPrices, 'arrayOfPricesPoints');
          console.log(arrayOfStkSpotPrices[0], 'AMD');
          console.log(arrayOfStkSpotPrices[1], 'AAPL');
          console.log(arrayOfStkSpotPrices[2], 'MSFT');
          console.log(arrayOfStkSpotPrices[3], 'TSLA');

          // 3. Combine each day's price into a value (data) point and send it to client
          // 3a. create a template for portfolio value
          const portfolioValueTimeSeries = arrayOfStkSpotPrices[0].priceDates.map((entry) => ({ date: entry.date, portfolioValue: 0 }));
          console.log(portfolioValueTimeSeries, 'arrayOfPortfolioValues');

          arrayOfStkSpotPrices.forEach((stkSpotPrice) => {
            stkSpotPrice.priceDates.forEach((priceDate, priceDateIndex) => {
              portfolioValueTimeSeries[priceDateIndex].portfolioValue += priceDate.cumValue;
            });
          });

          console.log(portfolioValueTimeSeries, 'cumulative values');
          res.send({ portfolioStocks: essentialQuoteInfo, portfolioValueTimeSeries });
        })
        .catch((error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  };

  const calculateEquity = () => {

  };

  const update = async (req, res) => {
    const { tradesData } = req.body;
    console.log(tradesData, 'tradesData');
    const updatedTradeData = tradesData.map(async (trade) => {
      const {
        portfolioStockId, position, costPrice, tradeDate, shares,
      } = trade;

      let newTrade;

      if (!trade.id) {
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

  const equity = async (req, res) => {
    // First get all of the
  };

  return ({
    index,
    view,
    update,
    equity,
  });
}
