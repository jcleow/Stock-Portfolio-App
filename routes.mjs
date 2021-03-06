import { resolve } from 'path';
import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
import stocks from './controllers/stocks.mjs';
import users from './controllers/users.mjs';
import portfolios from './controllers/portfolios.mjs';
import trades from './controllers/trades.mjs';

export default function bindRoutes(app) {
  app.use(async (req, res, next) => {
    req.middlewareLoggedIn = false;

    if (req.cookies.loggedInUserId) {
      const hash = convertUserIdToHash(req.cookies.loggedInUserId);

      if (req.cookies.loggedInHash === hash) {
        req.middlewareLoggedIn = true;
      }

      const { loggedInUserId } = req.cookies;
      // Find this user in the database
      const chosenUser = await db.User.findOne({
        where: {
          id: loggedInUserId,
        },
      });
      if (!chosenUser) {
        res.status(503).send('sorry an error has occurred');
      }
      req.middlewareLoggedIn = true;
      req.loggedInUserId = Number(req.cookies.loggedInUserId);
      req.loggedInUsername = chosenUser.username;
      next();
      return;
    }
    next();
  });

  // special JS page. Include the webpack index.html file
  app.get('/', (req, res) => {
    res.sendFile(resolve('dist', 'main.html'));
  });

  const UsersController = users(db);
  app.get('/checkLoggedIn', UsersController.checkLoggedIn);
  app.put('/signIn', UsersController.signIn);
  app.put('/signOut', UsersController.signOut);
  app.post('/register', UsersController.register);
  app.put('/currPortfolioId/:currPortfolioId', UsersController.updateCurrPortfolioId);

  const StocksController = stocks();
  app.get('/:symbol/chart/:duration', StocksController.getChart);
  app.get('/:symbol/headlineInfo', StocksController.getSymbol);
  app.get('/:symbol/stats', StocksController.getStats);

  const PortfoliosController = portfolios(db);
  app.get('/portfolios', PortfoliosController.index);
  app.get('/portfolios/:portfolioId', PortfoliosController.view);
  app.post('/portfolios/create', PortfoliosController.create);
  app.post('/portfolios/:portfolioId/addSymbol', PortfoliosController.add);
  app.delete('/portfolios/:portfolioId/delete', PortfoliosController.deletePortfolio);
  app.delete('/portfolioStocks/:portfolioStockId/delete', PortfoliosController.deletePortfolioStock);

  const TradesController = trades(db);
  app.get('/portfolioStocks/:portfolioStockId/trades', TradesController.index);
  app.get('/holidays', TradesController.getHolidays);
  app.put('/portfolios/:portfolioId/stocks/:portfolioStockId/update', TradesController.update);
}
