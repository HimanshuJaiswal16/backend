import {
    createDescriptionService,
    updateDescriptionService,
    getAllDescriptionsService,
    deleteDescriptionService
} from '../services/description.service.js';
import { errorResponseBody, successResponseBody } from '../utils/responseBody.js';
import { status_code } from '../utils/constants.js';

export const createDescription = async (req, res) => {
    try {

        const response = await createDescriptionService(req.body);

        successResponseBody.message = "Description created successfully.";
        successResponseBody.data = response;

        return res.status(status_code.CREATED).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const updateDescription = async (req, res) => {
    try {

        const response = await updateDescriptionService(req.body, req.params.descriptionId);

        successResponseBody.message = "Description updated successfully";
        successResponseBody.data = response;
        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

export const getAllDescriptions = async (req, res) => {
    try {

        const response = await getAllDescriptionsService();

        successResponseBody.message = "All Descriptions fetched successfully.";
        successResponseBody.data = response;
        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

export const deleteDescription = async (req, res) => {
    try {

        const response = await deleteDescriptionService(req.params.descriptionId);

        successResponseBody.message = "Description deleted successfully.";

        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}