import GroupMember from "../models/group-member.model.js";

export const addMembersInGroupService = async (members, groupId, transaction) => {
    try {
        //creates group and member mapping payload
        const groupMembers = members.map(memberId => (
            {
                groupId,
                memberId
            }
        ));

        const result = await GroupMember.bulkCreate(groupMembers, transaction);

        return result;

    } catch (error) {
        console.log(error);
        throw error;
    }
}