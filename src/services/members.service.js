import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";
import Transaction from '../models/transaction.model.js';
import { Op, fn, col } from 'sequelize';
import { resolveDateRange } from '../utils/utils.js';


// Work in paise (integers) to avoid floating point errors like 0.1 + 0.2
const toPaise = (value) => Math.round(Number(value || 0) * 100);

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
        const members = await Member.findAll();

        // total credit and debit per member, calculated in Postgres
        const totals = await Transaction.findAll({
            attributes: [
                'memberId',
                [fn('COALESCE', fn('SUM', col('credit')), 0), 'totalCredit'],
                [fn('COALESCE', fn('SUM', col('debit')), 0), 'totalDebit']
            ],
            group: ['memberId'],
            raw: true
        });

        // memberId -> balance (in paise)
        const balanceMap = new Map(
            totals.map((t) => [
                t.memberId,
                toPaise(t.totalCredit) - toPaise(t.totalDebit)
            ])
        );

        return members.map((member) => {
            const plain = member.get({ plain: true });

            return {
                ...plain,
                // members with no transactions get 0
                balance: (balanceMap.get(plain.memberId) || 0) / 100
            };
        });

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateUserService = async (body, memberId) => {
    try {

        const member = await Member.findByPk(memberId);

        if (!member) {
            throw { err: 'Member does not exist', code: status_code.BAD_REQUEST };
        };

        await member.update(
            body,
            {
                where: { memberId },
            }
        );

        delete member.toJSON().password;

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

        //validating is any group active.
        const groups = await member.getGroups({
            joinTableAttributes: []
        });

        if (
            groups.length &&
            groups.some(group => 
                group.totalAllotments > 0 && 
                group.totalAllotments !== group.totalMembers)
        ) {
            throw { err: 'Member is assigned with active Group', code: status_code.UNPROCESSABLE_ENTITY};
        };

        await member.destroy();

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

        if (!member) {
            throw { err: 'Member does not exist', code: status_code.BAD_REQUEST };
        }

        return member.toJSON();

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


export const getMemberLedgersService = async (query, memberId) => {
    try {
        const { fromDate, toDate } = query;

        const member = await Member.findByPk(memberId);

        if (!member) {
            throw { err: "Member does not exist", code: status_code.BAD_REQUEST };
        };

        //validating date range
        const { from, to, error } = resolveDateRange(fromDate, toDate);

        if (error) {
            throw { err: error, code: status_code.BAD_REQUEST };
        };

        //build the filter only with what was provided
        const where = {};

        if (from && to) {
            where.transactionDate = { [Op.between]: [from, to] };
        } else if (from) {
            where.transactionDate = { [Op.gte]: from };
        } else if (to) {
            where.transactionDate = { [Op.lte]: to };
        }

        //opening balance = everything before fromDate (only needed if fromDate is given)
        let runningTotal = 0;

        if (from) {
            const opening = await Transaction.findOne({
                attributes: [
                    [fn('COALESCE', fn('SUM', col('credit')), 0), 'totalCredit'],
                    [fn('COALESCE', fn('SUM', col('debit')), 0), 'totalDebit']
                ],
                where: {
                    memberId,
                    transactionDate: { [Op.lt]: from }
                },
                raw: true
            });

            runningTotal = toPaise(opening.totalCredit) - toPaise(opening.totalDebit);
        }

        //fetch filtered transactions OLDEST first, so the total builds up correctly
        const transactions = await member.getTransactions({
            where,
            order: [
                ['transactionDate', 'ASC'],
                ['createdAt', 'ASC']
            ]
        });

        const ledgers = transactions.map((txn) => {
            runningTotal += toPaise(txn.credit) - toPaise(txn.debit);

            return {
                ...txn.get({ plain: true }),
                total: runningTotal / 100
            };
        });

        //newest first for display
        return ledgers.reverse();

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