import { errorResponseBody, successResponseBody } from '../utils/responseBody.js';
import { status_code } from '../utils/constants.js';
import {
    createTransactionService,
    updateTransactionService,
    deleteTransactionService
} from '../services/transaction.service.js';

export const createTransaction = async (req, res) => {
    try {

        const response = await createTransactionService(req.body, req.params.memberId);

        successResponseBody.data = response;

        return res.status(status_code.CREATED).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const updateTransaction = async (req, res) => {
    try {

        const response = await updateTransactionService(req.body, req.params.transactionId);

        successResponseBody.data= response;

        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const deleteTransaction = async (req, res) => {
    try {

        const response = await deleteTransactionService(req.params.transactionId);

        successResponseBody.data = response;

        return res.status(status_code.OK).json(successResponseBody);
        
    } catch (error) {
         if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}