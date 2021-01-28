export default function initTradeModel(sequelize, DataTypes) {
  return sequelize.define('trade', {
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
    position: {
      type: DataTypes.ENUM('buy', 'sell'),
    },
    shares: {
      type: DataTypes.INTEGER,
    },
    tradeDate: {
      type: DataTypes.DATE,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    // The underscored option makes Sequelize reference snake_case names in the DB.
    underscored: true,
  });
}
