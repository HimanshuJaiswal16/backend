import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const TransactionDescription = sequelize.define(
  'TransactionDescription',
  {
    descriptionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    description: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: "transaction_descriptions",
    paranoid: true,
    timestamps: true
  }
);

export default TransactionDescription;


