import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';
import initUserModel from './user.mjs';
import initPortfolioModel from './portfolio.mjs';
import initStockModel from './stock.mjs';
import initPortfolioStockModel from './portfolioStock.mjs';
import initTradeModel from './trade.mjs';
import initNoteModel from './note.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

let sequelize;

if (env === 'production') {
  // break apart the Heroku database url and rebuild the configs we need

  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);

  const host = dbUrl.hostname;
  const { port } = dbUrl;

  config.host = host;
  config.port = port;

  sequelize = new Sequelize(dbName, username, password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Define all instances of the model
db.Portfolio = initPortfolioModel(sequelize, Sequelize.DataTypes);
db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Stock = initStockModel(sequelize, Sequelize.DataTypes);
db.PortfolioStock = initPortfolioStockModel(sequelize, Sequelize.DataTypes);
db.Trade = initTradeModel(sequelize, Sequelize.DataTypes);
db.Note = initNoteModel(sequelize, Sequelize.DataTypes);

// 1-M association between user and portfolios
db.Portfolio.belongsTo(db.User);
db.User.hasMany(db.Portfolio, { onDelete: 'cascade', foreignKey: { allowNull: false }, hooks: true });

db.PortfolioStock.hasMany(db.Trade, { onDelete: 'cascade', foreignKey: { allowNull: false }, hooks: true });
db.Trade.hasMany(db.Note);

// M:N association between portfolio and stock
db.Portfolio.belongsToMany(db.Stock, { through: db.PortfolioStock });
db.Stock.belongsToMany(db.Portfolio, { through: db.PortfolioStock });

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;
