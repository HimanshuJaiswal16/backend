import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Description = sequelize.define(
  'Description',
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
    tableName: "descriptions",
    paranoid: true,
    timestamps: true
  }
);

export default Description;


