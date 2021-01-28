export default function initPortfolioStockModel(sequelize, DataTypes) {
  return sequelize.define('portfolio_stock', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    portfolioId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'portfolios',
        key: 'id',
      },
    },
    stockId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'stocks',
        key: 'id',
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
}
