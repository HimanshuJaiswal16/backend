import {
    createAllotment,
    updateAllotment,
    getAllotments,
    getAllotmentDetailsById
} from '../controllers/allotment.controller.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const allotmentRoute = (app) => {
    app.post('/api/allotment/:groupId', isAuthenticated, isAdmin, createAllotment);
    app.put('/api/allotment/:groupId', isAuthenticated, isAdmin, updateAllotment);
    app.get('/api/allotments/:groupId', isAuthenticated, getAllotments);
    app.get('/api/allotment/:allotmentId', isAuthenticated, getAllotmentDetailsById);
}

export default allotmentRoute;