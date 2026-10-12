import {createGroupService, getAllGroupsService} from '../services/groups.service.js';
import { errorResponseBody, successResponseBody } from '../utils/responseBody.js';
import {status_code} from '../utils/constants.js';

export const createGroup = async (req, res) => {
    try {
        
        const response = await createGroupService(req.body);

        successResponseBody.data = response;
        successResponseBody.message = "Group created Successfully";
        res.status(status_code.CREATED).json(successResponseBody);

    } catch (error) {
        
        if (error.err) {
            errorResponseBody.err = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody)
    }
};

export const getAllGroups = async (req, res) => {
    try {

        const groups = await getAllGroupsService();

        successResponseBody.message = "All Groups fetched Successfully";
        successResponseBody.data = groups;
        return res.status(status_code.OK).json(successResponseBody);
        
    } catch (error) {

        errorResponseBody.err = error;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}