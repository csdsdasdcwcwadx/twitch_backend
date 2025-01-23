import express from 'express';
import { 
    addItem,
} from '../Controllers/item';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/addItem', upload.single('image'), addItem);

export default router;