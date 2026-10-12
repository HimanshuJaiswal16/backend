import Allotment from "../models/allotment.model.js";
import GroupAllotment from '../models/group-allotment.model.js';


export const createGroupAllotments = async (groupId, totalMembers, transaction) => {
    try {
        let allotments = [];
        for(let i = 0; i< totalMembers; i++) {
            allotments.push({
                groupId, 
                allotmentIndex: i
            });
        };

        console.log(allotments, "allotments");

        const allotmentResponse = await GroupAllotment.bulkCreate(allotments, transaction);

        return allotmentResponse;
        
    } catch (error) {
        console.log("Error in creating allotments for the Group", error);
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

export const createAllotmentService = async (body) => {
    try {
        const allotment = await Allotment.create(body);

        return allotment;
        
    } catch (error) {
        console.log("Error is adding allotment", error);

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