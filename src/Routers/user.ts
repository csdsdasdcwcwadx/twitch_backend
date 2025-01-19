import express from 'express';
import {
    login,
    logout
} from '../Controllers/user';

const router = express.Router();

router.get('/login', login);
router.get('/logout', logout);

export default router;