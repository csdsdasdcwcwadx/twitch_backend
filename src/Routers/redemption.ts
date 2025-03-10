import express from 'express';
import {
    exchange,
    updateStatus,
} from '../Controllers/redemption';

const router = express.Router();

router.post('/exchange', exchange);
router.post('/update', updateStatus);

export default router;