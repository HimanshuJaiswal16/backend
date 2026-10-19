import { 
    createGroup, 
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} from "../controllers/groups.controller.js";

import { isAuthenticated, isAdmin } from "../middlewares/auth.middleware.js";

const groupsRoute = (app) => {
    app.post('/api/group', isAuthenticated, isAdmin, createGroup);
    app.get('/api/groups', isAuthenticated, getAllGroups);
    app.get('/api/group/:groupId', isAuthenticated, getGroupById);
    app.put('/api/group/:groupId', isAuthenticated, isAdmin, updateGroup);
    app.delete('/api/group/:groupId', isAuthenticated, isAdmin, deleteGroup);
};

export default groupsRoute;