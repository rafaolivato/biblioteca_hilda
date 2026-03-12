import { Router } from 'express';
import { login } from '../controllers/AuthController.js'; // Adicione .js aqui

const router = Router();

router.post('/login', login);

export default router;