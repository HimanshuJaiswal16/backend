import {
    createDescription,
    updateDescription,
    getAllDescriptions,
    deleteDescription
} from '../controllers/description.controller.js';

import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const descriptionRoute = (app) => {
    app.post('/api/description', isAuthenticated, isAdmin, createDescription);
    app.put('/api/description/:descriptionId', isAuthenticated, isAdmin, updateDescription);
    app.get('/api/descriptions', isAuthenticated, getAllDescriptions);
    app.delete('/api/description/:descriptionId', isAuthenticated, isAdmin, deleteDescription);
}

export default descriptionRoute;