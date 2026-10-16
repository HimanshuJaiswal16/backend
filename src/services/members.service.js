import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";
import Transaction from '../models/transaction.model.js';

export const createMemberService = async (body) => {
    try {
        const response = await Member.create(body);

        const member = response.toJSON();
        delete member.password;
        return member;

    } catch (error) {

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

export const getAllMembersService = async () => {
    try {
        return await Member.findAll();

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateUserService = async (body, memberId) => {
    try {

        const [updatedMemberCount, updatedMember] = await Member.update(
            body,
            {
                where: { memberId },
                returning: true
            }
        );

        if (updatedMemberCount == 0) {
            const error = "Member not found.";
            throw { err: error, code: 404 };
        };

        const member = updatedMember[0].toJSON();
        delete member.password;

        return [member];

    } catch (error) {

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

export const deleteMemberService = async (memberId) => {
    try {
        const member = await Member.findByPk(memberId);

        if (!member) {
            let error = { err: 'Member not Found', code: status_code.BAD_REQUEST }
            throw error;
        };

        if (member.deletedAt !== null) {
            let error = { err: 'Member not Found', code: status_code.BAD_REQUEST }
            throw error;
        }

        await Member.destroy({
            where: {
                memberId
            }
        });

        return member;

    } catch (error) {

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

export const getMemberByIdService = async (memberId) => {
    try {
        const member = await Member.findByPk(memberId);

        const ledger = await member.getTransactions(
            {
                attributes: ['transactionId', 'credit', 'debit', 'transactionDate', 'note']
            }
        );

        return {
            ...member.toJSON(),
            ledger: ledger
        }


    } catch (error) {
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

export const getMemberGroupsService = async (memberId) => {
    try {

        const member = await Member.findByPk(memberId);

        if (!member) {
            throw { err: 'Member does not exist.', code: status_code.BAD_REQUEST };
        };

       const groups = await member.getGroups({
            attributes: ['groupId', 'name', 'groupAmount'],
            joinTableAttributes: [],
            include: [{
                model: Transaction,
                where: { memberId },
                required: false,         
                attributes: ['transactionId', 'credit', 'debit', 'transactionDate', 'note']
            }],
            order: [[Transaction, 'transactionDate', 'DESC']]
        });

        return groups.map((group) => {
            const { Transactions, ...rest } = group.toJSON();
            return { 
                ...rest, 
                totalCredit: Transactions.reduce((sum, t) => sum + Number(t.credit), 0),
                totalDebit: Transactions.reduce((sum, t) => sum + Number(t.debit), 0),
                transactions: Transactions 
            };
        });

    } catch (error) {
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