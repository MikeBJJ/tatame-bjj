import { Router } from 'express';
import { authRequired, permitir } from '../middlewares/auth.middleware.js';
import { listar, criar, atualizar, excluir } from '../controllers/alunos.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', permitir('ADM', 'Professor'), listar);
router.post('/', permitir('ADM', 'Professor'), criar);
router.put('/:id', permitir('ADM', 'Professor'), atualizar);
router.delete('/:id', permitir('ADM', 'Professor'), excluir);

export default router;