import 'dotenv/config';
import { Sequelize } from 'sequelize';

if (!process.env.DB_URL) {
    throw new Error('DB_URL environment variable is missing');
}

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',

    logging: false,

    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },

    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

export default sequelize;
