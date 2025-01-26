import express from 'express';
import { 
    addItem,
    deleteItem,
} from '../Controllers/item';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/additem', upload.single('image'), addItem);
router.post('/deleteitem', deleteItem);

export default router;