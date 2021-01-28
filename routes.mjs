import { resolve } from 'path';
import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
import stocks from './controllers/stocks.mjs';
import users from './controllers/user.mjs';

export default function routes(app) {
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
      console.log(req.loggedInUsername, 'app-use-username');
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
  app.post('/signin', UsersController.signin);

  const StocksController = stocks(db);
  app.get('/:symbol/chart/:duration', StocksController.getChart);
  app.get('/:symbol/headlineInfo', StocksController.getSymbol);
  app.get('/:symbol/stats', StocksController.getStats);
}
