
import { Op } from "sequelize";
import AllotmentGuarantor from "../models/allotment-guarantor.model.js";
import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";

// Validate guarantors
export const validateAllotmentGuarantors = (memberId, guarantors) => {
    if (!Array.isArray(guarantors) || guarantors.length !== 2) {
        throw {
            err: "Exactly two guarantors are required",
            code: status_code.BAD_REQUEST
        };
    }

    // Check duplicate guarantors
    if (guarantors[0] === guarantors[1]) {
        throw {
            err: "Guarantors should be different",
            code: status_code.BAD_REQUEST
        };
    }

    // Assigned member cannot be their own guarantor
    if (guarantors.includes(memberId)) {
        throw {
            err: "Assigned member cannot be their own guarantor",
            code: status_code.BAD_REQUEST
        };
    }
};

// Create guarantors
export const createAllotmentGuarantorsService = async (
    allotmentId,
    guarantors,
    transaction
) => {
    try {
        const existingMembers = await Member.findAll({
            where: {
                memberId: {
                    [Op.in]: guarantors
                }
            },
            attributes: ["memberId"],
            transaction
        });

        if (existingMembers.length !== 2) {
            throw {
                err: "One or more guarantors are invalid",
                code: status_code.BAD_REQUEST
            };
        }

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
    memberId,
    guarantors,
    transaction
) => {
    try {

        // Validate whether both guarantors exist
        const existingMembers = await Member.findAll({
            where: {
                memberId: {
                    [Op.in]: guarantors
                }
            },
            attributes: ["memberId"],
            transaction
        });

        if (existingMembers.length !== 2) {
            throw {
                err: "One or more guarantors do not exist",
                code: status_code.BAD_REQUEST
            };
        }

        // Remove existing guarantors
        await AllotmentGuarantor.destroy({
            where: { allotmentId },
            transaction
        });

        // Insert updated guarantors
        const updatedGuarantors = await AllotmentGuarantor.bulkCreate(
            guarantors.map((guarantorId) => ({
                allotmentId,
                memberId: guarantorId
            })),
            {
                transaction,
                validate: true
            }
        );

        return updatedGuarantors;

    } catch (error) {
        if (error.code) {
            throw error;
        }

        throw {
            err: error.message || "Failed to update allotment guarantors",
            code: status_code.BAD_REQUEST
        };
    }
};