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
          const arrayOfPricePoints = batchQuotes.map((quote) => {
            const dailyPrices = quote.chart.map((dailyQuote) => ({
              date: dailyQuote.date,
              price: dailyQuote.close,
            }));
            return {
              symbol: quote.quote.symbol,
              priceDates: dailyPrices,
            };
          });
          console.log(arrayOfPricePoints, 'arrayOfDailyPrices');
          // Merge price histories and dates into an object

          // 2a.if shares exist before the date of trade, accumulate them

          // 2b.if trades happen during the month, perform calculation on cumulative shares owned
          // and insert into the same index as the date of the month

          // Meld the portfolioStockId, symbol, tradeDate and tradedShares together in one obj for easy comparison
          // against the data provided by IEX
          const arrayOfDateStockTraded = arrayOfStockTrades.map((stockTraded) => {
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
          console.log(arrayOfDateStockTraded, 'arrayOfDateStockTraded');

          arrayOfPricePoints.forEach((stkPriceDate) => {
            arrayOfDateStockTraded.forEach((stkTxns) => {
              stkTxns.forEach((txn) => {
                if (stkPriceDate.symbol === txn.symbol) {
                  console.log('matched');
                  console.log(txn, 'stock transactions');
                  console.log(stkPriceDate, 'stock price point to be mutated');
                  const dateIndex = stkPriceDate.priceDates.findIndex((entry) => entry.date === txn.tradeDate);
                  console.log(dateIndex, 'dateIndex');

                  stkPriceDate.priceDates[dateIndex] = {
                    ...stkPriceDate.priceDates[dateIndex],
                    tradedShares: txn.tradedShares,
                    tradedValue: txn.tradedShares * stkPriceDate.priceDates[dateIndex].price,
                  };
                  console.log(stkPriceDate.priceDates[dateIndex], 'stkPriceDate');
                  console.log(stkPriceDate.priceDates, 'altered');
                }
              });
            });
          });

          // 3. propagate the number of shares forward to the next index if it is not empty (as each data pt required)

          // 4. Multiply the day's price and the shares owned at that day to get the value for that day

          // 5. Do this for all the stocks

          // 6. Combine each day's price into a value (data) point and output it

          res.send({ portfolioStocks: essentialQuoteInfo });
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
