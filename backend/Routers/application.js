
import express from 'express'

import auth from '../Middlewares/auth.js';
import { checkJob, checkStatus, postJOb, userApplication } from '../Controllers/application.js';


const router = express.Router();
router.post('/:jobId', auth,postJOb );
router.get('/my-applications', auth,checkJob );
router.get('/user-applications', auth,userApplication );
router.put('/:applicationId/status', auth, checkStatus);

module.exports = router;
