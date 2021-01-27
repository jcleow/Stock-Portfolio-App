import { resolve } from 'path';
import db from './models/index.mjs';
import stocks from './Controllers/stocks.mjs';

export default function routes(app) {
  // special JS page. Include the webpack index.html file
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  const StocksController = stocks(db);
  app.get('/quote/:duration', StocksController.getQuote);
}
