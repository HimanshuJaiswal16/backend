import { 
    createGroup, 
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} from "../controllers/groups.controller.js";

const groupsRoute = (app) => {
    app.post('/api/group', createGroup);
    app.get('/api/groups', getAllGroups);
    app.get('/api/group/:groupId', getGroupById);
    app.put('/api/group/:groupId', updateGroup);
    app.delete('/api/group/:groupId', deleteGroup);
};

export default groupsRoute;