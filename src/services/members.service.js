import Member from "../models/member.model.js";

export const createMemberService = async (body) => {
    try {
        const response = await Member.create(body);

        const member = response.toJSON();
        delete member.password;
        return member;

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

export const getAllMembersService = async () => {
    try {
        return await Member.findAll();

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateUserService = async (body, memberId) => {
    try {

        const [updatedMemberCount, updatedMember] = await Member.update(
            body,
            {
                where: { memberId },
                returning: true
            }
        );

        if (updatedMemberCount !== 0) {
            const error = "Member not found.";
            throw { err: error, code: 404 };
        };

        const member = updatedMember[0].toJSON();
        delete member.password;

        return [member];

    } catch (error) {
        console.log(error);
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