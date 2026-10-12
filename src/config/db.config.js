import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DATABASE,
    'jmbc',
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DIALECT
    }
);

export default sequelize;