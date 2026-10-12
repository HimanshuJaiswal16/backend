import Group from "../models/group.model.js";
import { addMembersInGroupService } from './group-member.service.js';
import { createGroupAllotments } from './allotment.service.js';
import sequelize from "../config/db.config.js";

export const createGroupService = async (body) => {
    try {
        const result = await sequelize.transaction(async (transaction) => {

            //creates Group.
            const group = await Group.create({...body, totalMembers: body.members.length});

            //map members with the Group.
            const groupMembers = await addMembersInGroupService(body.members, group.groupId, transaction);

            //create all allotments of the Group.
            await createGroupAllotments(group.groupId, body.members.length, transaction);

            return {
                ...group.toJSON(),
                members: groupMembers
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