import express from 'express';
import { 
    addCheck 
} from '../Controllers/check';

const router = express.Router();

router.post('/addcheck', addCheck);

export default router;