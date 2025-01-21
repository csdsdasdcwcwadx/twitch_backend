import express from 'express';
import { 
    addItem,
} from '../Controllers/item';

const router = express.Router();

router.post('/addItem', addItem);

export default router;