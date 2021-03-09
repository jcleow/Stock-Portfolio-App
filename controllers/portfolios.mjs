import axios from 'axios';
import { calcPortfolioValueAndCost, getBatchQuotes } from './helpers.mjs';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

export default function portfolios(db) {
  // Lists all the portfolios in the sidebar
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

  // View a single portfolio
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
      .then(() => {
        res.send({ message: 'newTradeCreated' });
      })
      .catch((err) => console.log(err));
  };

  // Create a new portfolio
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
    console.log(newSymbol, 'newSymbol');
    // first find if this stock exists in DB records, if not create a new one
    const stockInDB = await db.Stock.findOne({
      where:
    {
      stockSymbol: newSymbol.toLowerCase(),
    },
    });
    console.log(stockInDB?.id, 'stockInDB.stock');
    let stockInCurrPortfolio;
    if (stockInDB) {
      stockInCurrPortfolio = await db.PortfolioStock.findOne({
        where:
      {
        portfolioId,
        stockId: stockInDB.id,
      },
      });
    }
    console.log(stockInDB, 'stockToBeAdded');
    console.log(stockInCurrPortfolio, 'stockInCurrPortfolio');
    console.log(!stockInDB, 'stockToBeAdded not null');
    if (!stockInCurrPortfolio && !stockInDB) {
      axios.get(`${GENERICURL}/${newSymbol}/quote?token=${SANDBOXTOKEN}`)
        .then((result) => db.Stock.create({
          stockName: result.data.companyName,
          stockSymbol: newSymbol.toLowerCase(),
        }))
        .then((stockCreated) => db.PortfolioStock.create({
          portfolioId: Number(portfolioId),
          stockId: stockCreated.id,
        }))
        .then(() => {
          res.send({ message: 'completed' });
        })
        .catch((err) => {
          console.log(err);
          res.send({ message: 'failure', err });
        });
    } else if (stockInDB && !stockInCurrPortfolio) {
      await db.PortfolioStock.create({
        portfolioId: Number(portfolioId),
        stockId: stockInDB.id,
      });
    } else {
      res.send({ message: 'already exists' });
    }
  };

  // Delete a portfolio
  const deletePortfolio = async (req, res) => {
    const { portfolioId } = req.params;
    await db.Portfolio.destroy({
      where: {
        id: portfolioId,
      },
    });
    res.send({ message: 'portfolio deleted' });
  };

  // Delete a stock belonging to a portfolio
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
