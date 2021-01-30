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

      // get stock data in batch
      axios.get(`${GENERICURL}/market/batch?symbols=${selectedStockNamesString}&types=quote&token=${SANDBOXTOKEN}`)
        .then((batchResults) => {
          const batchQuotes = Object.values(batchResults.data);

          const essentialQuoteInfo = batchQuotes.map((stock) => {
            const {
              symbol, companyName, latestPrice, change, changePercent, avgTotalVolume, marketCap,
            } = stock.quote;

            const stockInfoObj = {
              symbol,
              companyName,
              latestPrice,
              change,
              changePercent,
              avgTotalVolume,
              marketCap,
            };
            console.log(stockInfoObj, 'stockInfoObj');
            return stockInfoObj;
          });
          res.send({ portfolioStocks: essentialQuoteInfo });
        })
        .catch((error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  };

  return ({
    index,
    view,
  });
}
