import { createGroup, getAllGroups } from "../controllers/groups.controller.js";

const groupsRoute = (app) => {
    app.post('/api/group', createGroup);
    app.get('/api/groups', getAllGroups);
};

export default groupsRoute;