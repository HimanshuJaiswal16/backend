import {
    createMember,
    getAllMembers,
    updateMember
} from '../controllers/members.controller.js';

const membersRoute = (app) => {
    app.post('/api/member', createMember);
    app.get('/api/members', getAllMembers);
    app.put('/api/member/:memberId', updateMember);
}

export default membersRoute;