import { errorResponseBody, successResponseBody } from '../utils/responseBody.js';
import {
    getAllMembersService,
    createMemberService,
    updateUserService,
    deleteMemberService,
    getMemberByIdService,
    getMemberGroupsService,
    getMemberLedgersService
} from '../services/members.service.js';
import { status_code } from '../utils/constants.js';

export const createMember = async (req, res) => {
    try {
        const response = await createMemberService(req.body);

        successResponseBody.data = response;
        successResponseBody.message = "Member created successfully!";

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

export const getAllMembers = async (req, res) => {
    try {
        console.log(req.member);
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
        successResponseBody.data = response;
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

export const getMemberById = async (req, res) => {
    try {

        const response = await getMemberByIdService(req.params.memberId);

        successResponseBody.data = response;
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

export const getMemberGroups = async (req, res) => {
    try {
        const response = await getMemberGroupsService(req.params.memberId);

        successResponseBody.data = response;
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

export const getMemberLedgers = async (req, res) => {
    try {
        const response = await getMemberLedgersService(req.query, req.params.memberId);

        successResponseBody.data = response;

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