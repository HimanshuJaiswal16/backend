import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import sequelize from './src/config/db.config.js';
import './src/models/index.js';

import membersRoute from './src/routes/members.route.js';
import groupsRoute from './src/routes/groups.route.js';
import allotmentRoute from './src/routes/allotments.route.js';
import descriptionRoute from './src/routes/descriptions.route.js';
import transactionRoute from './src/routes/transactions.route.js';
import authRoute from './src/routes/auth.route.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection management
let dbConnection;

const connectDB = async (req, res, next) => {
    try {
        if (!dbConnection) {
            dbConnection = sequelize.authenticate().catch((error) => {
                dbConnection = null;
                throw error;
            });
        }

        await dbConnection;
        next();

    } catch (error) {
        console.error('Database connection failed:', error);

        res.status(500).json({
            status: false,
            message: 'Database connection failed'
        });
    }
};

// Health check
app.get('/', (req, res) => {
    return res.status(200).json({
        status: 'Running',
        message: 'Express API is running'
    });
});

// Ensure DB connection before API requests
app.use(connectDB);

// Routes
membersRoute(app);
groupsRoute(app);
allotmentRoute(app);
descriptionRoute(app);
transactionRoute(app);
authRoute(app);

// Export app for Vercel
export default app;

// Local development only
if (process.env.NODE_ENV !== 'PRODUCTION') {
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

