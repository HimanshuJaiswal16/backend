import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';
import bcrypt from 'bcrypt';

const Member = sequelize.define(
    'Member',
    {
        memberId: {
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
                    msg: 'Member name is required.'
                },
                notEmpty: {
                    msg: 'Member name cannot be empty.'
                },
                len: {
                    args: [2, 255],
                    msg: 'Member name must be between 2 and 255 characters.'
                }
            }
        },

        mobileNumber: {
            type: DataTypes.STRING(10),
            allowNull: false,

            unique: {
                msg: 'This mobile number is already registered.'
            },

            validate: {
                notNull: {
                    msg: 'Mobile number is required.'
                },
                notEmpty: {
                    msg: 'Mobile number cannot be empty.'
                },
                is: {
                    args: /^\d{10}$/,
                    msg: 'Please enter a valid 10-digit mobile number.'
                }
            }
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: true,

            validate: {
                len: {
                    args: [6, 255],
                    msg: 'Password must be at least 6 characters long.'
                }
            }
        },

        isInterestRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,

            validate: {
                isBoolean(value) {
                    if (typeof value !== 'boolean') {
                        throw new Error(
                            'Interest required must be true or false.'
                        );
                    }
                }
            }
        },

        interestType: {
            type: DataTypes.ENUM(
                'PERCENTAGE',
                'FIXED AMOUNT',
                'NONE'
            ),
            allowNull: true,
            defaultValue: 'NONE',

            validate: {
                isIn: {
                    args: [['PERCENTAGE', 'FIXED AMOUNT', 'NONE']],
                    msg: 'Interest type must be PERCENTAGE or FIXED AMOUNT'
                }
            }
        },

        interest: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,

            validate: {
                isDecimal: {
                    msg: 'Interest must be a valid decimal number.'
                },
                min: {
                    args: [0],
                    msg: 'Interest cannot be negative.'
                }
            }
        },

        interestFrequency: {
            type: DataTypes.ENUM(
                'NONE',
                'DAILY',
                'MONTHLY',
                'YEARLY'
            ),
            allowNull: true,
            defaultValue: 'NONE',

            validate: {
                isIn: {
                    args: [['NONE', 'DAILY', 'MONTHLY', 'YEARLY']],
                    msg: 'Interest frequency must be Daily, Monthly, or Yearly.'
                }
            }
        },

        lastInterestApplied: {
            type: DataTypes.DATE,
            allowNull: true,

            validate: {
                isDate: {
                    msg: 'Last interest applied must be a valid date.'
                }
            }
        }
    },
    {
        tableName: 'members',
        paranoid: true,
        timestamps: true,
        defaultScope: {
            attributes: {
                exclude: ['password', 'isActive']
            }
        },
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10)
                    user.password = await bcrypt.hash(user.password, salt);
                };
            },
            beforeUpdate: async (user) => {
                if (user.changed('password') && user.password) {
                    const salt = await bcrypt.genSalt(10)
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
);

export default Member;