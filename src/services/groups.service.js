import Group from "../models/group.model.js";
import { createGroupAllotmentsService } from './allotment.service.js';
import sequelize from "../config/db.config.js";
import { status_code } from "../utils/constants.js";
import GroupMember from "../models/group-member.model.js";
import GroupAllotment from "../models/group-allotment.model.js";
import Allotment from "../models/allotment.model.js";

export const createGroupService = async (body) => {
    try {
        const result = await sequelize.transaction(async (transaction) => {

            //creates Group.
            const group = await Group.create({ ...body, totalMembers: body.members.length }, { transaction });

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

        await group.update(body);

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
}

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
}