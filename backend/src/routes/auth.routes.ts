import { Router } from 'express';
import { login, logout, getCurrentUser, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', authenticate, logout);
authRoutes.get('/me', authenticate, getCurrentUser);
authRoutes.post('/change-password', authenticate, changePassword);

