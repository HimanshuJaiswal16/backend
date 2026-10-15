import {
    createDescription,
    updateDescription,
    getAllDescriptions,
    deleteDescription
} from '../controllers/description.controller.js';

const descriptionRoute = (app) => {
    app.post('/api/description', createDescription);
    app.put('/api/description/:descriptionId', updateDescription);
    app.get('/api/descriptions', getAllDescriptions);
    app.delete('/api/description/:descriptionId', deleteDescription);
}

export default descriptionRoute;