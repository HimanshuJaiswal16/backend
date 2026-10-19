import {
    createMember,
    getAllMembers,
    updateMember,
    deleteMember,
    getMemberById,
    getMemberGroups,
    getMemberLedgers
} from '../controllers/members.controller.js';

import { isAuthenticated } from '../middlewares/auth.middleware.js';

const membersRoute = (app) => {
    app.post('/api/member', isAuthenticated, createMember);
    app.get('/api/members', isAuthenticated, getAllMembers);
    app.put('/api/member/:memberId', isAuthenticated, updateMember);
    app.delete('/api/member/:memberId', isAuthenticated, deleteMember);
    app.get('/api/member/:memberId', isAuthenticated, getMemberById);
    app.get('/api/member/getGroups/:memberId', isAuthenticated, getMemberGroups);
    app.get('/api/member/:memberId/ledgers', isAuthenticated, getMemberLedgers);
}

export default membersRoute;