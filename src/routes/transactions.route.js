import {
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transaction.controller.js';

import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const transactionRoute = (app) => {
    app.post('/api/transaction/:memberId', isAuthenticated, isAdmin, createTransaction);
    app.put('/api/transaction/:transactionId', isAuthenticated, isAdmin, updateTransaction);
    app.delete('/api/transaction/:transactionId', isAuthenticated, isAdmin, deleteTransaction);
};

export default transactionRoute;