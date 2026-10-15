import { errorResponseBody, successResponseBody } from '../utils/responseBody.js';
import {
    getAllMembersService,
    createMemberService,
    updateUserService,
    deleteMemberService
} from '../services/members.service.js';
import { status_code } from '../utils/constants.js';

export const createMember = async (req, res) => {
    try {
        const response = await createMemberService(req.body);

        successResponseBody.data = response;
        successResponseBody.message = "Member created successfully!";

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

export const getAllMembers = async (req, res) => {
    try {
        const response = await getAllMembersService();

        successResponseBody.message = "Successfully fetched all members";
        successResponseBody.data = response;

        return res.status(status_code.OK).json(successResponseBody);
    } catch (error) {
        
        errorResponseBody.err = error;
        errorResponseBody.message = "Error in getting data, cannot process request";

        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}

export const updateMember = async (req, res) => {
    try {
        const response = await updateUserService(req.body, req.params.memberId);

        successResponseBody.data = response;
        successResponseBody.message = "Member details updated!";
        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.message = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        errorResponseBody.message = error?.message;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const deleteMember = async (req, res) => {
    try {

        const response = await deleteMemberService(req.params.memberId);

        successResponseBody.message = "Member Deleted Successfully.";
        return res.status(status_code.OK).json(successResponseBody);

    } catch (error) {
        if (error.err) {
            errorResponseBody.message = error.err;
            return res.status(error.code).json(errorResponseBody);
        }

        errorResponseBody.err = error;
        errorResponseBody.message = error?.message;
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
}
