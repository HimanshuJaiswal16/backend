import {
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transaction.controller.js';

import { isAuthenticated } from '../middlewares/auth.middleware.js';

const transactionRoute = (app) => {
    app.post('/api/transaction/:memberId', isAuthenticated, createTransaction);
    app.put('/api/transaction/:transactionId', isAuthenticated, updateTransaction);
    app.delete('/api/transaction/:transactionId', isAuthenticated, deleteTransaction);
};

export default transactionRoute;