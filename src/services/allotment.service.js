import Allotment from "../models/allotment.model.js";
import GroupAllotment from '../models/group-allotment.model.js';
import Group from "../models/group.model.js";
import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";
import Transaction from "../models/transaction.model.js";
import sequelize from "../config/db.config.js";
import { resolveDateTime } from '../utils/utils.js';
import {
    createAllotmentGuarantorsService,
    validateAllotmentGuarantors,
    updateAllotmentGuarantor
} from './allotment-guarantors.service.js';

import AllotmentGuarantor from "../models/allotment-guarantor.model.js";


export const createGroupAllotmentsService = async (group, totalMembers, transaction) => {
    try {

        const allotments = Array.from({ length: totalMembers }, (_, i) => (
            {
                groupId: group.groupId,
                allotmentIndex: i
            }
        ));

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
            const isGroupAllotment = await group.hasGroupAllotment(body.allotmentId, { transaction });

            if (!isGroupAllotment) {
                throw { err: 'Allotment does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating member belong to the requested group
            const isGroupMember = await group.hasMember(body.memberId, { transaction });

            if (!isGroupMember) {
                throw { err: 'Member does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating alloment is already done with same alloment id
            const alreadyAllotted = await Allotment.findByPk(body.allotmentId, { transaction });
            if (alreadyAllotted) {
                throw { err: 'This allotment slot is already allotted.', code: status_code.BAD_REQUEST };
            };

            //validate member
            const memberAlreadyAllotted = await GroupAllotment.findOne({
                where: {
                    groupId,
                    memberId: body.memberId
                },
                transaction
            });

            if (memberAlreadyAllotted && memberAlreadyAllotted.allotmentId) {
                throw { err: 'Member is already alloted.', code: status_code.BAD_REQUEST };
            };

            // Validate guarantors and prevent self-guarantee
            await validateAllotmentGuarantors(
                body.memberId,
                body.guarantors
            );

            // Assigning an allotment to the member
            await GroupAllotment.update(
                { memberId: body.memberId },
                {
                    where: {
                        allotmentId: body.allotmentId
                    }
                },
                { transaction }
            );

            //validating & resolving transaction date
            const allotmentDate = resolveDateTime(body.allotmentDate);

            const allotment = await Allotment.create({ ...body, allotmentDate }, { transaction });

            //assigning guarantors
            await createAllotmentGuarantorsService(
                body.allotmentId,
                body.guarantors,
                transaction
            );

            // creating allotment transaction of the member 
            await Transaction.create({
                memberId: body.memberId,
                groupId: groupId,
                allotmentId: body.allotmentId,
                credit: body.allotmentAmount,
                transactionDate: allotmentDate,
                note: `allotment amount of ${group.name}`
            },
                { transaction }
            );

            // creating alloment share transaction of each members belong to the requested group
            const groupMembers = await group.getMembers({
                attributes: ['memberId'],
                joinTableAttributes: [],
                transaction
            });

            const sharingAmount = body.allotmentAmount / groupMembers.length;

            //transaction date when sharing allotment Amount
            const transactionDate = resolveDateTime(body.allotmentDate);

            const memberTransactions = groupMembers.map((member) => ({
                memberId: member.memberId,
                allotmentId: body.allotmentId,
                groupId: groupId,
                debit: sharingAmount,
                transactionDate: transactionDate,
                note: `${group.name} allotment share`
            }));

            await Transaction.bulkCreate(memberTransactions, {
                transaction,
                validate: true
            });

            //after allotment done to the user successfully, update group's totalAllotment
            await group.increment('totalAllotments', {
                by: 1,
                transaction
            });

            return allotment;

        });

        return result;

    } catch (error) {
        console.log("Error in adding allotment", error);

        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError' ||
            error.name == 'SequelizeDatabaseError'
        ) {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw { err: err, code: status_code.BAD_REQUEST };
        }

        throw error;
    }
};

export const updateAllomentService = async (body, groupId) => {
    try {

        const result = await sequelize.transaction(async (transaction) => {
            //validating requested group
            const group = await Group.findByPk(groupId, { transaction });

            if (!group) {
                throw { err: 'Group doesnot exist', code: status_code.BAD_REQUEST }
            };

            //validating alloment belong to the requested group
            const isGroupAllotmentId = await group.hasGroupAllotment(body.allotmentId, { transaction });

            if (!isGroupAllotmentId) {
                throw { err: 'Allotment does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating member belong to the requested group
            const isGroupMember = await group.hasMember(body.memberId, { transaction });

            if (!isGroupMember) {
                throw { err: 'Member does not belong to the requested group.', code: status_code.BAD_REQUEST }
            };

            //validating alloment is not done already
            const groupAllotment = await GroupAllotment.findByPk(body.allotmentId, { transaction });
            if (!groupAllotment) {
                throw { err: 'This allotment slot is not allotted.', code: status_code.BAD_REQUEST };
            };

            //validating & resolving transaction date
            const allotmentDate = resolveDateTime(body.allotmentDate);

            //validating that the requested member already alloted in the group
            if (groupAllotment.memberId !== body.memberId) {
                const memberAllotment = await GroupAllotment.findOne(
                    {
                        where: {
                            memberId: body.memberId,
                            groupId
                        },
                        transaction
                    }
                );

                if (memberAllotment && memberAllotment.allotmentId !== body.allotmentId) {
                    throw { err: 'This member is already alloted.', code: status_code.BAD_REQUEST }
                };

                // Validate guarantors and prevent self-guarantee
                await validateAllotmentGuarantors(
                    body.memberId,
                    body.guarantors
                );

                //updating member for an allotment
                await GroupAllotment.update(
                    {
                        memberId: body.memberId
                    },
                    {
                        where: {
                            allotmentId: body.allotmentId,
                            groupId
                        },
                        returning: true,
                        transaction
                    }
                );


                await Allotment.update(
                    {
                        ...body,
                        allotmentDate,
                        memberId: body.memberId
                    },
                    {
                        where: {
                            allotmentId: body.allotmentId
                        },
                        transaction
                    }
                );


            };

            if (groupAllotment.memberId == body.memberId) {
                await Allotment.update(
                    {
                        ...body,
                        allotmentDate
                    },
                    {
                        where: {
                            allotmentId: body.allotmentId
                        },
                        transaction
                    }
                );
            };

            //destroy all transactions for an allotment
            await Transaction.destroy(
                {
                    where: {
                        allotmentId: body.allotmentId
                    },
                    transaction
                }
            );

            await updateAllotmentGuarantor(
                body.allotmentId,
                body.memberId,
                body.guarantors,
                transaction
            );

            // creating new allotment transaction of each members 
            await Transaction.create({
                memberId: body.memberId,
                groupId: groupId,
                allotmentId: body.allotmentId,
                credit: body.allotmentAmount,
                transactionDate: allotmentDate,
                note: `allotment amount of ${group.name}`
            },
                { transaction }
            );

            // creating alloment share transaction of each members belong to the requested group
            const groupMembers = await group.getMembers({
                attributes: ['memberId'],
                joinTableAttributes: [],
                transaction
            });

            const updatedSharingAmount = body.allotmentAmount / groupMembers.length;
            //transaction date when sharing allotment Amount
            const transactionDate = resolveDateTime(body.allotmentDate);

            const memberTransactions = groupMembers.map((member) => ({
                memberId: member.memberId,
                allotmentId: body.allotmentId,
                groupId: groupId,
                debit: updatedSharingAmount,
                transactionDate: transactionDate,
                note: `${group.name} allotment share`
            }));

            await Transaction.bulkCreate(memberTransactions, {
                transaction,
                validate: true
            });


            return groupAllotment;

        });
        return result;

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

            throw { err: err, code: status_code.BAD_REQUEST };
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

            throw { err: err, code: status_code.BAD_REQUEST };
        }

        throw error;
    }
};

export const getAllotmentDetailsByIdService = async (allotmentId) => {
    try {
        const allotment = await Allotment.findByPk(allotmentId, {
            include: [
                {
                    model: Member,
                    as: 'guarantors',
                    attributes: [
                        'memberId',
                        'name'
                    ],
                    through: {
                        attributes: []
                    }
                }
            ]
        });

        if (!allotment) {
            throw {
                err: "No such allotment exists",
                code: status_code.BAD_REQUEST
            };
        }

        return allotment;

    } catch (error) {
        console.log("Error in getting allotment details", error);

        if (
            error.name === 'SequelizeUniqueConstraintError' ||
            error.name === 'SequelizeValidationError' ||
            error.name === 'SequelizeDatabaseError'
        ) {
            let err = {};

            Object.keys(error.errors || {}).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw {
                err,
                code: status_code.BAD_REQUEST
            };
        }

        throw error;
    }
};