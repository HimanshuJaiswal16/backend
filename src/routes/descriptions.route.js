import {
    createDescription,
    updateDescription,
    getAllDescriptions,
    deleteDescription
} from '../controllers/description.controller.js';

import { isAuthenticated } from '../middlewares/auth.middleware.js';

const descriptionRoute = (app) => {
    app.post('/api/description', isAuthenticated, createDescription);
    app.put('/api/description/:descriptionId', isAuthenticated, updateDescription);
    app.get('/api/descriptions', isAuthenticated, getAllDescriptions);
    app.delete('/api/description/:descriptionId', isAuthenticated, deleteDescription);
}

export default descriptionRoute;