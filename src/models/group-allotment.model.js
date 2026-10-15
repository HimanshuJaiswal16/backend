
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const GroupAllotment = sequelize.define(
    'GroupAllotment',
    {
        allotmentId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },

        allotmentIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: {
                    msg: 'Allotment index must be an integer.'
                },
                min: {
                    args: [0],
                    msg: 'Allotment index must be greater than or equal to 0.'
                }
            }
        }
    },
    {
        tableName: 'group_allotments',
        timestamps: true,
    }
);

export default GroupAllotment;
