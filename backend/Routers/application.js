
import express from 'express'

import auth from '../Middlewares/auth.js';
import { checkJob, checkStatus, postJOb, userApplication } from '../Controllers/application.js';


const approuter = express.Router();
approuter.post('/:jobId', auth,postJOb );
approuter.get('/my-applications', auth,checkJob );
approuter.get('/user-applications', auth,userApplication );
approuter.put('/:applicationId/status', auth, checkStatus);

export default approuter;
