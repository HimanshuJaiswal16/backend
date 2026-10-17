import Description from "../models/description.model.js";
import Member from "../models/member.model.js";
import Transaction from "../models/transaction.model.js";
import { status_code } from "../utils/constants.js";

export const createTransactionService = async (body, memberId) => {
    try {
        let note = body.note || '';

        //validating member
        const member = await Member.findByPk(memberId);

        if (!member) {
            throw { err: 'Member does not exist', code: status_code.BAD_REQUEST };
        };

        //validating amounts
        if((body.credit && typeof body.credit !== "number" )|| (body.debit && typeof body.debit !== "number")) {
            throw {err: 'Amount should a number', code: status_code.BAD_REQUEST};
        };

        if (Number(body.credit) && Number(body.debit)) {
            throw { err: 'A transaction cannot have both credit and debit amounts.', code: status_code.BAD_REQUEST };
        };

        //validating description
        if (body.descriptionId) {
            const description = await Description.findByPk(body.descriptionId);

            if (!description) {
                throw { err: 'Description doesnot exist', code: status_code.BAD_REQUEST }
            };

            note = `${description.description || ''}- ${body.note || ''}`;
        };

        //create a new transaction
        const transaction = await Transaction.create(
            {
                ...body,
                memberId,
                note
            });

        return transaction;


    } catch (error) {
        console.log('Error in creating transaction', error);
        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError'
        ) {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw { err: err, code: 400 };
        }

        throw error;
    }
};

export const updateTransactionService = async (body, transactionId) => {
    try {
        let note = body.note || '';

        //validating transactionId
        const transaction = await Transaction.findByPk(transactionId);

        if (!transaction) {
            throw { err: 'This transaction does not exist', code: status_code.BAD_REQUEST };
        };

        //validating amounts
        if((body.credit && typeof body.credit !== "number" )|| (body.debit && typeof body.debit !== "number")) {
            throw {err: 'Amount should a number', code: status_code.BAD_REQUEST};
        };

        if (body.credit && body.debit) {
            throw { err: 'A transaction cannot have both credit and debit amounts.', code: status_code.BAD_REQUEST };
        };

        //validating description
        if (body.descriptionId) {
            const description = await Description.findByPk(body.descriptionId);

            if (!description) {
                throw { err: 'Description doesnot exist', code: status_code.BAD_REQUEST }
            };

            note = `${description.description || ''}- ${body.note || ''}`;
        };

        transaction.update(
            {
                transactionDate: body.transactionDate,
                credit: body.credit || 0,
                debit: body.debit || 0,
                note,
                descriptionId: body.descriptionId || null
            }
        );

        return transaction;

    } catch (error) {
        console.log('Error in updating transaction', error);
        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError'
        ) {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw { err: err, code: 400 };
        }

        throw error;
    }
};

export const deleteTransactionService = async (transactionId) => {
    try {
        const transaction = await Transaction.findByPk(transactionId);

        if (!transaction) {
            throw { err: 'This transaction does not exist', code: status_code.BAD_REQUEST };
        };

        transaction.destroy();

        return transaction;

    } catch (error) {
         console.log('Error in deleting transaction', error);
        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError'
        ) {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw { err: err, code: 400 };
        }

        throw error;
    }
}