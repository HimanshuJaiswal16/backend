import Member from "../models/member.model.js";
import { status_code } from "../utils/constants.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUpMemberService = async (body) => {
    try {
        if (!body.password) {
            throw { err: 'Passoword is required', code: status_code.BAD_REQUEST };
        };

        const userDetail = {
            name: body.name,
            mobileNumber: body.mobileNumber,
            password: body.password,
            isInterestRequired: false
        }

        const user = await Member.create(userDetail);

        return user;

    } catch (error) {
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

export const signInMemberService = async (body) => {
    try {

        //validate member
        const member = await Member.scope(null).findOne({
            where: {
                mobileNumber: body.mobileNumber
            }
        });

        if(!member) {
            throw {err: 'Invalid credientials', code: status_code.UNAUTHORIZED};
        };

        //comparing password
        const isPasswordValid = await bcrypt.compare(body.password, member.password);

        if(!isPasswordValid) {
            throw {err: 'Invalid credientials', code: status_code.UNAUTHORIZED }
        };

        const token = jwt.sign(
            {id: member.memberId, mobileNumber: member.mobileNumber},
            process.env.AUTH_KEY,
            {expiresIn: '1h'}
        )

        //remove password from final json
        const result = member.toJSON();
        delete result.password;

        return {
            ...result,
            token
        };
        
    } catch (error) {
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