import express from 'express';
import { 
    createOrder,
    paymentResult,
} from '../Controllers/payment';

const router = express.Router();

router.post('/createorder', createOrder);
router.post('/paymentresult', paymentResult);

export default router;