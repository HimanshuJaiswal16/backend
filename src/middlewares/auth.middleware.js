import { MEMBER_ROLE, status_code } from "../utils/constants.js";
import { errorResponseBody } from "../utils/responseBody.js";
import jwt from 'jsonwebtoken';
import { getMemberByIdService } from '../services/members.service.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if (!token) {
            errorResponseBody.err = 'Member is unauthroized';
            return res.status(status_code.FORBIDDEN).json(errorResponseBody);
        };

        //verifying token
        const response = jwt.verify(token, process.env.AUTH_KEY);
        if (!response) {
            errorResponseBody.err = 'Member is unauthroized';
            return res.status(status_code.UNAUTHORIZED).json(errorResponseBody);
        };

        //fetching member details
        const member = await getMemberByIdService(response.id);
        req.member = {
            id: member.memberId,
            role: member.role
        };

        next();

    } catch (error) {

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError'
        ) {

            errorResponseBody.err = error.message;
            errorResponseBody.message = 'Unauthorized';
            return res.status(status_code.UNAUTHORIZED).json(errorResponseBody);
        }

        errorResponseBody.message = 'Authentication failed'
        return res.status(status_code.INTERNAL_SERVER_ERROR).json(errorResponseBody);
    }
};

export const isAdmin = (req, res, next) => {
    const member = req.member;

    if (member.role !== MEMBER_ROLE.admin) {
        errorResponseBody.err = 'Member is Unauthorized'
        return res.status(status_code.UNAUTHORIZED).json(errorResponseBody);
    }

    next();
}