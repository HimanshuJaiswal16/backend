import 'dotenv/config';
import express from 'express';
import sequelize from './src/config/db.config.js';
import './src/index.js';

import membersRoute from './src/routes/members.route.js';
import groupsRoute from './src/routes/groups.route.js';
import allotmentRoute from './src/routes/allotments.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
membersRoute(app);
groupsRoute(app);
allotmentRoute(app);

app.listen(process.env.PORT, async () => {
    console.log('server is running');

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({alter: true});
        console.log('Database synchronized successfully.');
      
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});