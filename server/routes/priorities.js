import { Router } from 'express';
import * as controller from '../controllers/prioritiesController.js';

const router = Router();

router.get('/', controller.listPriorities);
router.post('/', controller.assignPriority);
router.put('/:priority', controller.replacePriorityAssignment);

export default router;
