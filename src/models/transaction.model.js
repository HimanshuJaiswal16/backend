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
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: 'Amount cannot be negative.'
                }
            }
        },

        debit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: 'Amount cannot be negative.'
                }
            }
        },

        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        note: {
            type: DataTypes.STRING
        },

    },
    {
        tableName: "transactions",
        timestamps: true
    }
);

export default Transaction;