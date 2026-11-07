import Member from "../models/member.model.js";
import { MEMBER_ROLE, status_code } from "../utils/constants.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUpMemberService = async (body) => {
    try {
        if (!body.password) {
            throw { err: 'Passoword is required', code: status_code.BAD_REQUEST };
        };

        const userDetails = {
            name: body.name,
            mobileNumber: body.mobileNumber,
            password: body.password,
            isInterestRequired: false,
            role: 'ADMIN'
        }

        const user = await Member.create(userDetails);

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

        if (!member) {
            throw { err: 'Invalid credientials', code: status_code.UNAUTHORIZED };
        };

        if (member.role !== MEMBER_ROLE.admin) {
            throw { err: 'Unauthorized to sign-in', code: status_code.UNAUTHORIZED };
        };

        //comparing password
        const isPasswordValid = await bcrypt.compare(body.password, member.password);

        if (!isPasswordValid) {
            throw { err: 'Invalid credientials', code: status_code.UNAUTHORIZED }
        };

        const token = jwt.sign(
            {
                id: member.memberId,
                mobileNumber: member.mobileNumber,
                role: member.role
            },
            process.env.AUTH_KEY,
            { expiresIn: '1h' }
        )

        //remove password from final json
        const result = member.toJSON();
        delete result.password;

        return {
            ...result,
            token
        };

    } catch (error) {
        console.log('Error is signin', error);
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

export const resetPasswordService = async (body) => {
    try {
        const member = await Member.scope(null).findOne({
            where: {
                mobileNumber: body.mobileNumber
            }
        });

        if (!member) {
            throw { err: 'Member doesnot exist', code: status_code.BAD_REQUEST };
        };

        if (member.role !== MEMBER_ROLE.admin) {
            throw { err: 'Member is unauthorized to reset password', code: status_code.UNAUTHORIZED };
        };

        //verifying with old password
        const isPasswordMatchesWithOldPassword = await bcrypt.compare(body.newPassword, member.password);

        if (isPasswordMatchesWithOldPassword) {
            throw { err: 'Try New Password', code: status_code.UNPROCESSABLE_ENTITY };
        };

        //updating password
        await member.update(
            { password: body.newPassword }
        );

        return;

    } catch (error) {
        console.log('Error in reseting error', error);
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