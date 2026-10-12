
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Allotment = sequelize.define(
    'Allotment',
    {
        allotmentId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'group_allotments',
                key: 'allotmentId'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },

        memberId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'members',
                key: 'memberId'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            validate: {
                notNull: {
                    msg: 'Member ID is required.'
                },
                isUUID: {
                    args: 4,
                    msg: 'Member ID must be a valid UUID.'
                }
            }
        },

        baseBid: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Base bid is required.'
                },
                min: {
                    args: [0],
                    msg: 'Base bid cannot be negative.'
                }
            }
        },

        biddingAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Bidding amount is required.'
                },
                min: {
                    args: [0],
                    msg: 'Bidding amount cannot be negative.'
                }
            }
        },

        allotmentAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Allotment amount is required.'
                },
                min: {
                    args: [0],
                    msg: 'Allotment amount cannot be negative.'
                }
            }
        },

        allotmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Allotment date is required.'
                },
                isDate: {
                    msg: 'Allotment date must be a valid date.'
                }
            }
        }
    },
    {
        tableName: 'allotments',
        timestamps: true,

        indexes: [
            {
                name: 'unique_member_per_group_slot_assignment',
                unique: true,
                fields: ['allotmentId']
            }
        ]
    }
);

export default Allotment;
