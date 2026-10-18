import {
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transaction.controller.js';

const transactionRoute = (app) => {
    app.post('/api/transaction/:memberId', createTransaction);
    app.put('/api/transaction/:transactionId', updateTransaction);
    app.delete('/api/transaction/:transactionId', deleteTransaction);
};

export default transactionRoute;