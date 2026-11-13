import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DATABASE,
    'jmbc',
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DIALECT,
        logging: false,

        pool: {
            max: 3,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default sequelize;
