import express from 'express';
import {
    login
} from '../Controllers/user';

const router = express.Router();

router.get('/login', login);

export default router;