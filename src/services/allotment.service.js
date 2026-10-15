import Allotment from "../models/allotment.model.js";
import GroupAllotment from '../models/group-allotment.model.js';
import Group from "../models/group.model.js";
import { status_code } from "../utils/constants.js";
import Transaction from "../models/transactions.model.js";
import sequelize from "../config/db.config.js";

export const createGroupAllotmentsService = async (group, totalMembers, transaction) => {
    try {

        const allotments = Array.from({ length: totalMembers }, (_, i) => (
            {
                groupId: group.groupId,
                allotmentIndex: i
            }
        ))

        await GroupAllotment.bulkCreate(allotments, {
            transaction,
            validate: true
        });

        return;

    } catch (error) {
        console.log("Error in creating allotments for the Group", error);
        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError' ||
            error.name == 'AggregateError'

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

export const createAllotmentService = async (body, groupId) => {
    try {
        const result = await sequelize.transaction(async (transaction) => {

            //validating requested group
            const group = await Group.findByPk(groupId, { transaction });

            if (!group) {
                throw { err: 'Group doesnot exist', code: status_code.BAD_REQUEST }
            };

            //validating alloment belong to the requested group
            const isGroupAllotment = await group.hasGroupAllotment(body.allotmentId, {transaction});

            if (!isGroupAllotment) {
                throw { err: 'Allotment does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating member belong to the requested group
            const isGroupMember = await group.hasMember(body.memberId, {transaction});

            if (!isGroupMember) {
                throw { err: 'Member does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating alloment is already done with same alloment id
            const alreadyAllotted = await Allotment.findByPk(body.allotmentId, { transaction });
            if (alreadyAllotted) {
                throw { err: 'This allotment slot is already allotted.', code: status_code.BAD_REQUEST };
            };

            // 1. Assigning an allotment to the member
            const allotment = await Allotment.create(body, { transaction });

            //2. creating allotment transaction of the member 
            await Transaction.create({
                memberId: body.memberId,
                groupId: groupId,
                allotmentId: body.allotmentId,
                credit: body.allotmentAmount,
                transactionDate: body.allotmentDate,
                note: `allotment amount of ${group.name}`
            },
                { transaction }
            );

            //3. creating alloment share transaction of each members belong to the requested group
            const groupMembers = await group.getMembers({
                attributes: ['memberId'],
                joinTableAttributes: [],
                transaction
            });

            const sharingAmount = body.allotmentAmount / groupMembers.length;

            const a = groupMembers.map((member) => ({
                memberId: member.memberId,
                allotmentId: body.allotmentId,
                groupId: groupId,
                debit: sharingAmount,
                transactionDate: body.allotmentDate,
                note: 'abc'
            }));

            await Transaction.bulkCreate(a, {
                transaction,
                validate: true
            })

            return allotment;

        });

        return result;

    } catch (error) {
        console.log("Error in adding allotment", error);

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

export const updateAllomentService = async (body, allotmentId) => {
    try {

        const allotment = await Allotment.findByPk(allotmentId);

        if (!allotment) {
            throw { err: 'Allotment not found', code: status_code.BAD_REQUEST };
        };

        allotment.update(
            body,
            {
                fields: ['memberId', 'baseBid', 'biddingAmount', 'allotmentAmount']
            }
        );

        return allotment;

    } catch (error) {
        console.log("Error in updating allotment", error);

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

export const getAllotmentsService = async (groupId) => {
    try {

        const group = await Group.findByPk(groupId);

        if (!group) {
            throw { err: "Group does not exist", code: status_code.BAD_REQUEST };
        };

        const allotments = await GroupAllotment.findAll({
            where: {
                groupId
            }
        });

        return allotments;

    } catch (error) {
        console.log("Error in fetching all allotments", error);

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