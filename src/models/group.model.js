import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Group = sequelize.define(
    'Group',
    {
        groupId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Group name is required.'
                },
                notEmpty: {
                    msg: 'Group name cannot be empty.'
                },
                len: {
                    args: [2, 255],
                    msg: 'Group name must be between 2 and 255 characters.'
                }
            }
        },

        groupAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Group amount is required.'
                },
                isDecimal: {
                    msg: 'Group amount must be a valid decimal number.'
                },
                min: {
                    args: [0],
                    msg: 'Group amount cannot be negative.'
                }
            }
        },

        totalMembers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Total members is required.'
                },
                isInt: {
                    msg: 'Total members must be an integer.'
                },
                min: {
                    args: [0],
                    msg: 'Total members cannot be negative.'
                }
            }
        },

        startDate: {
            type: DataTypes.DATE,
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Start date is required.'
                },
                isDate: {
                    msg: 'Start date must be a valid date.'
                }
            }
        },

        groupInterest: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Group interest is required.'
                },
                isDecimal: {
                    msg: 'Group interest must be a valid decimal number.'
                },
                min: {
                    args: [0],
                    msg: 'Group interest cannot be less than 0%.'
                },
                max: {
                    args: [100],
                    msg: 'Group interest cannot be greater than 100%.'
                }
            }
        },

        totalAllotments: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,

            validate: {
                notNull: {
                    msg: 'Total allotments is required.'
                },
                isInt: {
                    msg: 'Total allotments must be an integer.'
                },
                min: {
                    args: [0],
                    msg: 'Total allotments cannot be negative.'
                }
            }
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    },

    {
        tableName: 'groups',
        timestamps: true,

        defaultScope: {
            attributes: {
                exclude: ['isActive']
            }
        }
    }
);

export default Group;