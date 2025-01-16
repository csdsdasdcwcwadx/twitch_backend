import express from 'express';
import { 
    addCheck,
    updateCheckStatus,
} from '../Controllers/check';

const router = express.Router();

router.post('/addcheck', addCheck);
router.post('/updatecheckstatus', updateCheckStatus);

export default router;