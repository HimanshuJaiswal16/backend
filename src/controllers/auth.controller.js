import { status_code } from '../utils/constants.js';
import {
    signUpMemberService,
    signInMemberService,
    resetPasswordService
} from '../services/auth.service.js';
import { successResponseBody, errorResponseBody } from '../utils/responseBody.js';

export const signUpMember = async (req, res) => {
    try {

        await signUpMemberService(req.body);

        successResponseBody.message = 'Member Registered successfully';
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

export const signInMember = async (req, res) => {
    try {
        const response = await signInMemberService(req.body);

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
};

export const resetPassword = async (req, res) => {
    try {
        await resetPasswordService(req.body);

        successResponseBody.message = "Password updated successfully";

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