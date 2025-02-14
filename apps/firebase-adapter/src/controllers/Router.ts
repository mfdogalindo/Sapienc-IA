// apps/ai/src/controllers/Router.ts
import { Router } from "express";
import { ProjectsController } from "./ProjectsController";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const projectsController = new ProjectsController();

const uploadMiddleware = upload.single('file');

const router = Router();


router.get('/api/projects', projectsController.getProjects);
router.post('/api/projects', projectsController.createProject);
router.get('/api/projects/:projectId', projectsController.getProject);
router.delete('/api/projects/:projectId', projectsController.deleteProject);
router.post('/api/projects/:projectId/files', uploadMiddleware, projectsController.uploadFile);
router.post('/api/projects/:projectId/files/:fileId/delete', projectsController.deleteFile);
router.get('/api/projects/:projectId/files/:fileId/download', projectsController.downloadFile);
router.get('/api/projects/:projectId/files', projectsController.getProjectFiles);


export default router;