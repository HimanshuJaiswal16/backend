import { errorResponseBody, successResponseBody } from "../utils/responseBody.js";
import {
    createAllotmentService,
    updateAllomentService,
    getAllotmentsService
} from "../services/allotment.service.js";
import { status_code } from "../utils/constants.js";

export const createAllotment = async (req, res) => {
    try {
        const response = await createAllotmentService(req.body, req.params.groupId);

        successResponseBody.message = 'Allotment is done to the member';
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

export const updateAllotment = async (req, res) => {
    try {

        const response = await updateAllomentService(req.body, req.params.allotmentId);

        successResponseBody.data = response;
        successResponseBody.message = "Allotment updated successfully";

        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const getAllotments = async(req, res) => {
    try {

        const response = await getAllotmentsService(req.params.groupId);

        successResponseBody.message = "All group allotments fetched successfully";
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