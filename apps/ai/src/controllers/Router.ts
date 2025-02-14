// apps/ai/src/controllers/Router.ts
import { Router } from "express";
import { AIController } from "./AIController";

const aiController = new AIController();
const router = Router();

router.get('/api/models', aiController.getModels);
router.post('/api/model', aiController.setModel);
router.post('/api/documents', aiController.addDocument);
router.post('/api/query', aiController.query);

export default router;