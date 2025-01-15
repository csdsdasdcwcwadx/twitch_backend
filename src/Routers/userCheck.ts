import express from 'express';
import { 
    checked, 
} from '../Controllers/userCheck';

const router = express.Router();

router.post('/sign', checked);

export default router;