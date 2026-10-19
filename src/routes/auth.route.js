import {
    signUpMember,
    signInMember,
    resetPassword
} from '../controllers/auth.controller.js';

const authRoute = (app) => {
    app.post('/api/signup', signUpMember);
    app.post('/api/signin', signInMember);
    app.put('/api/reset-password', resetPassword);
};

export default authRoute;