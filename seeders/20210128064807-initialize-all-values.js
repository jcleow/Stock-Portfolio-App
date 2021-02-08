const jsSHA = require('jssha');

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update('password');
    const hashedPassword = shaObj.getHash('HEX');
    const usersList = [
      {
        username: 'user1',
        password: hashedPassword,
        logged_in: false,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        username: 'user2',
        password: hashedPassword,
        logged_in: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const stocksList = [
      {
        stock_name: 'Advanced Micro Devices',
        stock_symbol: 'amd',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        stock_name: 'Apple Inc',
        stock_symbol: 'aapl',
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        stock_name: 'Microsoft Corporation',
        stock_symbol: 'msft',
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        stock_name: 'Tesla Inc',
        stock_symbol: 'tsla',
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        stock_name: 'Twitter Inc',
        stock_symbol: 'twtr',
        created_at: new Date(),
        updated_at: new Date(),
      },

    ];
    const portfolioList = [
      {
        user_id: 1,
        name: 'Tech Stocks',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const portfolioStocksList = [
      {
        portfolio_id: 1,
        stock_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        portfolio_id: 1,
        stock_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        portfolio_id: 1,
        stock_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      }, {
        portfolio_id: 1,
        stock_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const tradesList = [
      {
        portfolio_stock_id: 1,
        position: 'BUY',
        cost_price: 200,
        shares: 200,
        trade_date: new Date('2021/02/03'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        portfolio_stock_id: 2,
        position: 'BUY',
        cost_price: 150,
        shares: 150,
        trade_date: new Date('2021/02/04'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        portfolio_stock_id: 3,
        position: 'BUY',
        cost_price: 300,
        shares: 300,
        trade_date: new Date('2021/01/21'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        portfolio_stock_id: 4,
        position: 'BUY',
        cost_price: 400,
        shares: 400,
        trade_date: new Date('2021/01/25'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', usersList);
    await queryInterface.bulkInsert('stocks', stocksList);
    await queryInterface.bulkInsert('portfolios', portfolioList);
    await queryInterface.bulkInsert('portfolio_stocks', portfolioStocksList);
    await queryInterface.bulkInsert('trades', tradesList);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('stocks', null, {});
    await queryInterface.bulkDelete('portfolios', null, {});
    await queryInterface.bulkDelete('portfolio_stocks', null, {});
    await queryInterface.bulkDelete('trades', null, {});
  },
};
