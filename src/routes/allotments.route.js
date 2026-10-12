import {createAllotment} from '../controllers/allotment.controller.js';

const allotmentRoute = (app) => {
    app.post('/api/allotment', createAllotment);
}

export default allotmentRoute;