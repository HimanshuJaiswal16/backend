import {
    createMember,
    getAllMembers,
    updateMember,
    deleteMember
} from '../controllers/members.controller.js';

const membersRoute = (app) => {
    app.post('/api/member', createMember);
    app.get('/api/members', getAllMembers);
    app.put('/api/member/:memberId', updateMember);
    app.delete('/api/member/:memberId', deleteMember);
}

export default membersRoute;