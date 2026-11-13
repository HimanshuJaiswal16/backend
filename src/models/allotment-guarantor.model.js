import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const AllotmentGuarantor = sequelize.define(
    'AllotmentGuarantor',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        allotmentId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        memberId: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        tableName: 'allotment_guarantors',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['allotmentId', 'memberId']
            }
        ]
    }
);

export default AllotmentGuarantor;