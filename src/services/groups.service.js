import Group from "../models/group.model.js";
import { createGroupAllotmentsService } from './allotment.service.js';
import sequelize from "../config/db.config.js";
import { status_code } from "../utils/constants.js";
import Allotment from "../models/allotment.model.js";
import { resolveDateTime } from '../utils/utils.js';
import Member from "../models/member.model.js";

export const createGroupService = async (body, adminId) => {
    try {
        const result = await sequelize.transaction(async (transaction) => {

            //validating & resolving transaction date
            const startDate = resolveDateTime(body.startDate);

            //creates Group.
            const group = await Group.create(
                {
                    ...body,
                    startDate: startDate,
                    totalMembers: body.members.length
                },
                { transaction }
            );

            //adding admin to the group.
            body.members.push(adminId);

            //add associated members in the group
            await group.addMembers(body.members, { transaction });

            //create all allotments of the Group.
            await createGroupAllotmentsService(group, body.members.length, transaction);

            //get all members of the group
            const getMembers = await group.getMembers({
                attributes: ['memberId', 'name', 'mobileNumber'],
                joinTableAttributes: [],
                transaction
            });

            //Get Group Allotments
            const groupAllotments = await group.getGroupAllotments({
                attributes: ['allotmentId', 'allotmentIndex'],
                order: [['allotmentIndex', 'ASC']],
                transaction
            });

            return {
                ...group.toJSON(),
                members: getMembers,
                allotments: groupAllotments
            }

        });

        return result;

    } catch (error) {
        console.log("Error in creating Group", error);

        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError' ||
            error.name == 'SequelizeForeignKeyConstraintError'

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

export const getAllGroupsService = async () => {
    try {
        const groups = await Group.findAll();

        return groups;

    } catch (error) {
        console.log("Error in getting all groups", error);
        throw error;
    }
};

export const getGroupByIdService = async (groupId) => {
    try {
        //1. get group details
        const group = await Group.findByPk(groupId);

        if (!group) {
            throw { error: "Group not found", code: status_code.BAD_REQUEST };
        }

        //2. get group members details (no include here)
        const groupMembers = await group.getMembers({
            attributes: ['memberId', 'name', 'mobileNumber'],
            joinTableAttributes: [],
        });

        //3. get group allotments WITH the member who got each slot
        const groupAllotments = await group.getGroupAllotments({
            attributes: ['allotmentId', 'allotmentIndex'],
            include: [{
                model: Allotment,
                attributes: ['memberId'],
                required: false
            }],
            order: [['allotmentIndex', 'ASC']]
        });

        // Set of memberIds allotted in THIS group
        const allottedMemberIds = new Set(
            groupAllotments
                .filter((a) => a.Allotment)
                .map((a) => a.Allotment.memberId)
        );

        //4. members with their allotment status
        const members = groupMembers.map((member) => ({
            ...member.toJSON(),
            isAlloted: allottedMemberIds.has(member.memberId)
        }));

        //5. allotment slots with status and member
        const allotments = groupAllotments.map((a) => ({
            allotmentId: a.allotmentId,
            allotmentIndex: a.allotmentIndex,
            isAlloted: !!a.Allotment,
            memberId: a.Allotment?.memberId ?? null
        }));

        return {
            ...group.toJSON(),
            members,
            allotments
        };

    } catch (error) {
        console.log("Error in getting Group", error);

        if (
            error.name == 'SequelizeUniqueConstraintError' ||
            error.name == 'SequelizeValidationError'
        ) {
            let err = {};
            Object.keys(error.errors).forEach((key) => {
                err[key] = error.errors[key].message;
            });

            throw { err: err, code: 400 };
        };

        throw error;
    }
};

export const updateGroupService = async (body, groupId) => {
    try {

        const group = await Group.findByPk(groupId);

        if (!group) {
            throw { err: "Group not found", code: status_code.BAD_REQUEST };
        };

        //validating & resolving transaction date
        const startDate = resolveDateTime(body.startDate);

        await group.update({ ...body, startDate });

        return group.toJSON();

    } catch (error) {
        console.log("Error in updating Group", error);

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

export const deleteGroupService = async (groupId) => {
    try {

        const group = await Group.findByPk(groupId);

        if (!group) {
            throw { err: "Group not found", code: status_code.BAD_REQUEST };
        };

        if (group.totalAllotments > 0 && group.totalAllotments != group.totalMembers) {
            throw { err: "Group is currently active", code: status_code.UNPROCESSABLE_ENTITY };
        };

        await group.destroy();

        return group.toJSON();

    } catch (error) {
        console.log("Error in updating Group", error);

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

export const getGroupDetailsForPdfService = async (groupId) => {
    try {
        // 1. Get group details
        const group = await Group.findByPk(groupId);

        if (!group) {
            throw {
                error: "Group not found",
                code: status_code.BAD_REQUEST
            };
        }

        // 2. Get all group members
        const groupMembers = await group.getMembers({
            attributes: [
                'memberId',
                'name',
                'mobileNumber'
            ],
            joinTableAttributes: []
        });

        // 3. Get all group allotment slots with complete
        // allotment details and their guarantors
        const groupAllotments = await group.getGroupAllotments({
            attributes: [
                'allotmentId',
                'allotmentIndex'
            ],
            include: [
                {
                    model: Allotment,
                    required: false,
                    include: [
                        {
                            model: Member,
                            as: 'guarantors',
                            attributes: [
                                'memberId',
                                'name',
                                'mobileNumber'
                            ],
                            through: {
                                attributes: []
                            }
                        }
                    ]
                }
            ],
            order: [
                ['allotmentIndex', 'ASC']
            ]
        });

        // 4. Get member IDs who have received allotments
        const allottedMemberIds = new Set(
            groupAllotments
                .filter((item) => item.Allotment)
                .map((item) => item.Allotment.memberId)
        );

        // 5. Add allotment status to group members
        const members = groupMembers.map((member) => ({
            ...member.toJSON(),
            isAlloted: allottedMemberIds.has(member.memberId)
        }));

        // 6. Prepare allotment slots with complete details
        const allotments = groupAllotments.map((item) => ({
            allotmentId: item.allotmentId,
            allotmentIndex: item.allotmentIndex,
            isAlloted: !!item.Allotment,
            allotment: item.Allotment
                ? item.Allotment.toJSON()
                : null
        }));

        // 7. Return complete group details
        return {
            ...group.toJSON(),
            members,
            allotments
        };

    } catch (error) {
        console.log("Error in getting Group details for PDF", error);

        if (
            error.name === 'SequelizeUniqueConstraintError' ||
            error.name === 'SequelizeValidationError'
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
