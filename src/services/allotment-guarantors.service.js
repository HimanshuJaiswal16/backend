
import { Op } from "sequelize";
import AllotmentGuarantor from "../models/allotment-guarantor.model.js";
import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";

// Validate guarantors
export const validateAllotmentGuarantors = async (memberId, guarantors, group, transaction) => {
    try {

        if (guarantors.length > 2) {
            throw {
                err: 'Only two guarantors are allowed.',
                code: status_code.BAD_REQUEST
            };
        };

        const existingMembers = await Member.findAll({
            where: {
                memberId: {
                    [Op.in]: guarantors
                }
            },
            attributes: ["memberId"],
            transaction
        });

        if (existingMembers.length !== new Set(guarantors).size) {
            throw {
                err: "One or more guarantors are invalid",
                code: status_code.BAD_REQUEST
            };
        };

        // Get all members belonging to the group
        const members = await group.getMembers({
            attributes: ['memberId'],
            joinTableAttributes: [],
            transaction
        });

        // Extract group member IDs
        const groupMemberIds = new Set(
            members.map(member => member.memberId)
        );

        // Check whether all guarantors belong to this group
        const areGuarantorsInGroup = guarantors.every(
            guarantorId => groupMemberIds.has(guarantorId)
        );

        if (!areGuarantorsInGroup) {
            throw {
                err: 'One or more guarantors do not belong to this group.',
                code: status_code.BAD_REQUEST
            };
        }

        if (guarantors.length == 2) {
            // Check duplicate guarantors
            if (guarantors[0] === guarantors[1]) {
                throw {
                    err: "Guarantors should be different",
                    code: status_code.BAD_REQUEST
                };
            }
        }

        // Assigned member cannot be their own guarantor
        if (guarantors.includes(memberId)) {
            throw {
                err: "Assigned member cannot be their own guarantor",
                code: status_code.BAD_REQUEST
            };
        }

    } catch (error) {
        console.log("Error in validating Guarantors", error);
        throw error;
    }
};

// Create guarantors
export const createAllotmentGuarantorsService = async (
    allotmentId,
    guarantors,
    transaction
) => {
    try {

        const result = await AllotmentGuarantor.bulkCreate(
            guarantors.map(memberId => ({
                allotmentId,
                memberId
            })),
            {
                transaction,
                validate: true
            }
        );

        return result;

    } catch (error) {
        console.log("Error in creating allotment guarantors", error);

        if (
            error.name === "SequelizeUniqueConstraintError" ||
            error.name === "SequelizeValidationError" ||
            error.name === "AggregateError"
        ) {
            const err = {};

            error.errors?.forEach(item => {
                err[item.path] = item.message;
            });

            throw {
                err: Object.keys(err).length ? err : error.message,
                code: status_code.BAD_REQUEST
            };
        }

        throw error;
    }
};


export const updateAllotmentGuarantor = async (
    allotmentId,
    guarantors,
    transaction
) => {
    try {
        // Fetch all existing guarantors
        const existingGuarantors = await AllotmentGuarantor.findAll({
            where: { allotmentId },
            transaction,
            order: [['createdAt', 'ASC']]
        });

        // If the new guarantor list is empty,
        // delete all existing guarantors
        if (guarantors.length === 0) {
            await AllotmentGuarantor.destroy({
                where: { allotmentId },
                transaction
            });

            return [];
        }

        // Existing guarantor IDs
        const existingMemberIds = existingGuarantors.map(
            item => item.memberId
        );

        // New guarantor IDs
        const newMemberIds = [...new Set(guarantors)];

        // Find guarantors that are already present
        const commonGuarantors = existingGuarantors.filter(
            item => newMemberIds.includes(item.memberId)
        );

        // Guarantors that need to be added
        const guarantorsToAdd = newMemberIds.filter(
            memberId => !existingMemberIds.includes(memberId)
        );

        // Existing records that are not present in the new list
        const guarantorsToReplace = existingGuarantors.filter(
            item => !newMemberIds.includes(item.memberId)
        );

        // Replace old guarantors with new guarantors
        const replaceCount = Math.min(
            guarantorsToReplace.length,
            guarantorsToAdd.length
        );

        for (let i = 0; i < replaceCount; i++) {
            await guarantorsToReplace[i].update(
                {
                    memberId: guarantorsToAdd[i]
                },
                { transaction }
            );
        }

        // If additional guarantors remain, insert them
        const remainingGuarantors = guarantorsToAdd.slice(replaceCount);

        if (remainingGuarantors.length > 0) {
            await AllotmentGuarantor.bulkCreate(
                remainingGuarantors.map(memberId => ({
                    allotmentId,
                    memberId
                })),
                {
                    transaction,
                    validate: true
                }
            );
        }

        // If existing guarantors exceed the new list,
        // remove only the extra records
        const remainingRecordsToDelete =
            guarantorsToReplace.slice(replaceCount);

        if (remainingRecordsToDelete.length > 0) {
            await AllotmentGuarantor.destroy({
                where: {
                    id: remainingRecordsToDelete.map(item => item.id)
                },
                transaction
            });
        }

        return await AllotmentGuarantor.findAll({
            where: { allotmentId },
            transaction
        });

    } catch (error) {
        console.log("Error in updating allotment guarantors", error);

        if (error.code) {
            throw error;
        }

        throw {
            err: error.message || "Failed to update allotment guarantors",
            code: status_code.BAD_REQUEST
        };
    }
};
