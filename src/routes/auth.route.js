import {
    signUpMember,
    signInMember
} from '../controllers/auth.controller.js';

const authRoute = (app) => {
    app.post('/api/signup', signUpMember);
    app.post('/api/signin', signInMember);
};

export default authRoute;