import Description from '../models/description.model.js';
import { status_code } from '../utils/constants.js';

export const createDescriptionService = async (body) => {
    try {

        const descriptions = await Description.create(body);

        return descriptions;

    } catch (error) {
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

export const updateDescriptionService = async (body, descriptionId) => {
    try {

        const [updatedDescriptionCount, updatedDescription] = await Description.update(
            body,
            {
                where: { descriptionId },
                returning: true
            }
        );

        if (updatedDescriptionCount == 0) {
            const error = "Description not found.";
            throw { err: error, code: status_code.NOT_FOUND };
        };

        const description = updatedDescription[0].toJSON();

        return [description];


    } catch (error) {
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

export const getAllDescriptionsService = async () => {
    try {

        const descriptions = await Description.findAll();

        return descriptions;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteDescriptionService = async (descriptionId) => {
    try {

        const description = await Description.findByPk(descriptionId);

         if(!description) {
            let error = {err: 'Description not Found', code: status_code.BAD_REQUEST}
            throw error;
        };

        if(description.deletedAt !== null){
            let error = {err: 'Description not Found', code: status_code.BAD_REQUEST}
            throw error;
        }

        const deletedDescription = await Description.destroy(
            {
                where: {
                    descriptionId
                }
            }
        );

        return deletedDescription;

    } catch (error) {
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
}