import {createAllotment, updateAllotment, getAllotments} from '../controllers/allotment.controller.js';

const allotmentRoute = (app) => {
    app.post('/api/allotment/:groupId', createAllotment);
    app.put('/api/allotment/:groupId', updateAllotment);
    app.get('/api/allotments/:groupId', getAllotments);
}

export default allotmentRoute;