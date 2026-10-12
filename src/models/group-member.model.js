import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const GroupMember = sequelize.define(
    'GroupMember',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
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
                notNull: {
                    msg: 'Group ID is required.'
                },
                isUUID: {
                    args: 4,
                    msg: 'Group ID must be a valid UUID.'
                }
            }
        },

        memberId: {
            type: DataTypes.UUID,
            allowNull: false,

            references: {
                model: 'members',
                key: 'memberId'
            },

            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',

            validate: {
                notNull: {
                    msg: 'Member ID is required.'
                },
                isUUID: {
                    args: 4,
                    msg: 'Member ID must be a valid UUID.'
                }
            }
        }
    },

    {
        tableName: 'group_members',
        timestamps: true,

        indexes: [
            {
                name: 'unique_group_member',
                unique: true,
                fields: ['groupId', 'memberId']
            }
        ]
    }
);

export default GroupMember;