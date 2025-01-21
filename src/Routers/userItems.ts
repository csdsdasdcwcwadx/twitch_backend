import express from 'express';
import { 
    ownItem, 
} from '../Controllers/userItem';

const router = express.Router();

router.post('/ownitem', ownItem);

export default router;