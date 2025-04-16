import express from 'express';
import {
    login,
    logout,
    redirect,
} from '../Controllers/user';

const router = express.Router();

router.get('/login', login);
router.get('/logout', logout);
router.post('/redirect', redirect);

export default router;