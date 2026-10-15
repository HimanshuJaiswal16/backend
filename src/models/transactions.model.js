import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Transaction = sequelize.define(
    'Transaction',
    {
        transactionId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },

        credit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        debit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.DATE
        },

        note: {
            type: DataTypes.STRING
        },

    },
    {
        tableName: "transactions",
        paranoid: true,
        timestamps: true
    }
);

export default Transaction;