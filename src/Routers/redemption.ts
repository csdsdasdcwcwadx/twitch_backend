import express from 'express';
import {
    exchange,
} from '../Controllers/redemption';

const router = express.Router();

router.post('/exchange', exchange);

export default router;