import {
    createMember,
    getAllMembers,
    updateMember,
    deleteMember,
    getMemberById,
    getMemberGroups,
    getMemberLedgers
} from '../controllers/members.controller.js';

const membersRoute = (app) => {
    app.post('/api/member', createMember);
    app.get('/api/members', getAllMembers);
    app.put('/api/member/:memberId', updateMember);
    app.delete('/api/member/:memberId', deleteMember);
    app.get('/api/member/:memberId', getMemberById);
    app.get('/api/member/getGroups/:memberId', getMemberGroups);
    app.get('/api/member/:memberId/ledgers', getMemberLedgers);
}

export default membersRoute;