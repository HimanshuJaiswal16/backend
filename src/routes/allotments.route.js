import {createAllotment, updateAllotment, getAllotments} from '../controllers/allotment.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const allotmentRoute = (app) => {
    app.post('/api/allotment/:groupId', isAuthenticated, createAllotment);
    app.put('/api/allotment/:groupId', isAuthenticated, updateAllotment);
    app.get('/api/allotments/:groupId', isAuthenticated, getAllotments);
}

export default allotmentRoute;