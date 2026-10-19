import { status_code } from "../utils/constants.js";
import { errorResponseBody } from "../utils/responseBody.js";
import jwt from 'jsonwebtoken';
import { getMemberByIdService } from '../services/members.service.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if (!token) {
            errorResponseBody.err = 'You are unauthroized';
            return res.status(status_code.FORBIDDEN).json(errorResponseBody);
        };

        //verifying token
        const response = jwt.verify(token, process.env.AUTH_KEY);
        if (!response) {
            errorResponseBody.err = 'You are unauthroized';
            return res.status(status_code.UNAUTHORIZED).json(errorResponseBody);
        };

        //fetching member details
        const member = await getMemberByIdService(response.id);
        req.id = member.memberId;

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
}