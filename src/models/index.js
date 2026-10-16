import Member from "./member.model.js";
import Group from "./group.model.js";
import GroupMember from "./group-member.model.js";
import GroupAllotment from "./group-allotment.model.js";
import Allotment from "./allotment.model.js";
// import TransactionDescription from "./transaction-description.model.js";
import Transaction from "./transaction.model.js";

//Group-Member associations through GroupMember Model
Group.belongsToMany(Member, {
    through: GroupMember,
    foreignKey: 'groupId',
    otherKey: 'memberId'
});

Member.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: 'memberId',
    otherKey: 'groupId'
});

//Group can have multiple Allotments but an Allotment belongs to one Group.
Group.hasMany(GroupAllotment, {
    foreignKey: 'groupId',
    onDelete: 'CASCADE'
});

GroupAllotment.belongsTo(Group, {
    foreignKey: 'groupId',
    onDelete: 'CASCADE'
});

// Member can have multiple Allotments but an Allotment belong to one Member.
Member.hasMany(Allotment, {
    foreignKey: 'memberId',
    onDelete: 'CASCADE'
});

Allotment.belongsTo(Member, {
    foreignKey: 'memberId',
    onDelete: 'CASCADE'
});

//A member can have only one allotment in a group and an allotment belong to one member in a group.
Member.hasOne(GroupAllotment, {
    foreignKey: 'memberId',
    onDelete: 'CASCADE'
});

GroupAllotment.belongsTo(Member, {
    foreignKey: 'memberId',
    onDelete: 'CASCADE'
});

//Relation between GroupAllotments and Allotments
GroupAllotment.hasOne(Allotment, {
    foreignKey: 'allotmentId'
});

Allotment.belongsTo(GroupAllotment, {
    foreignKey: 'allotmentId'
});

//a member can have multiple transactions but a transaction can only belong to one member.
Member.hasMany(Transaction, {
    foreignKey: 'memberId'
});

Transaction.belongsTo(Member, {
    foreignKey: 'memberId'
});

//a group can have multiple transactions but a transaction can only belong to one group.
Group.hasMany(Transaction, {
    foreignKey: 'groupId'
});

Transaction.belongsTo(Group, {
    foreignKey: 'groupId'
});

//a allotment can have muliple transaction but a transaction have only one allotments.
Allotment.hasMany(Transaction, {
    foreignKey: 'allotmentId'
});

Transaction.belongsTo(Allotment, {
    foreignKey: 'allotmentId'
});
