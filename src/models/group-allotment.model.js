
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const GroupAllotment = sequelize.define(
    'GroupAllotment',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        allotmentId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique: true
        },

        groupId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'groups',
                key: 'groupId'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            validate: {
                isUUID: {
                    args: 4,
                    msg: 'Group ID must be a valid UUID.'
                }
            }
        },

        allotmentIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: {
                    msg: 'Allotment index must be an integer.'
                },
                min: {
                    args: [1],
                    msg: 'Allotment index must be greater than 0.'
                }
            }
        }
    },
    {
        tableName: 'group_allotments',
        timestamps: true,

        indexes: [
            {
                name: 'unique_group_allotment_index',
                unique: true,
                fields: ['groupId', 'allotmentIndex']
            }
        ]
    }
);

export default GroupAllotment;
