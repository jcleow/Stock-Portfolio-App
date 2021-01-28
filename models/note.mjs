export default function initNoteModel(sequelize, DataTypes) {
  return sequelize.define('note', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    tradeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'trades',
        key: 'id',
      },
    },
    note: {
      type: DataTypes.STRING,
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
