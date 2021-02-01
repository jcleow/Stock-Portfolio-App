import axios from 'axios';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';

export default function portfolios(db) {
  const index = async (req, res) => {
    console.log(req.cookies.loggedInUserId, 'loggedInUserId');
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
      const selectedStockNames = selectedPortfolio.stocks.map((stock) => stock.stockSymbol);
      const selectedStockNamesString = selectedStockNames.join(',');

      const selectedStockIds = selectedPortfolio.stocks.map((stock) => ({ id: stock.id, symbol: stock.stockSymbol }));
      console.log(selectedStockIds, 'selectedStockIds');

      // get stock data in batch
      axios.get(`${GENERICURL}/market/batch?symbols=${selectedStockNamesString}&types=quote&token=${SANDBOXTOKEN}`)
        .then((batchResults) => {
          const batchQuotes = Object.values(batchResults.data);
          // Destructure the information from API call
          const essentialQuoteInfo = batchQuotes.map((stock) => {
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
            };
            return stockInfoObj;
          });

          res.send({ portfolioStocks: essentialQuoteInfo });
        })
        .catch((error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  };
  const update = async (req, res) => {
    const { tradesData } = req.body;
    console.log(tradesData, 'tradesData');
    tradesData.map(async (trade) => {
      if (!trade.tradeId) {
        const {
          portfolioStockId, position, costPrice, tradeDate, shares,
        } = trade;
        await db.Trade.create({
          portfolioStockId, position, costPrice, tradeDate, shares,
        });
      }
    });

    res.send({ message: 'newTradeCreated' });
  };

  return ({
    index,
    view,
    update,
  });
}
