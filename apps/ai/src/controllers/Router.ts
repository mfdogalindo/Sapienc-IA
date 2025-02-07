import { Router } from "express";
import { AIController } from "./AIController";
import { ProjectsController } from "./ProjectsController";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const aiController = new AIController();
const projectsController = new ProjectsController();

const uploadMiddleware = upload.single('file');

const router = Router();

router.get('/api/models', aiController.getModels);
router.post('/api/model', aiController.setModel);
router.post('/api/documents', aiController.addDocument);
router.post('/api/query', aiController.query);

router.get('/api/projects', projectsController.getProjects);
router.post('/api/projects', projectsController.createProject);
router.get('/api/projects/:projectId', projectsController.getProject);
router.delete('/api/projects/:projectId', projectsController.deleteProject);
router.post('/api/projects/:projectId/files', uploadMiddleware, projectsController.uploadFile);
router.post('/api/projects/:projectId/files/:fileId/delete', projectsController.deleteFile);
router.get('/api/projects/:projectId/files/:fileId/download', projectsController.downloadFile);
router.get('/api/projects/:projectId/files', projectsController.getProjectFiles);


export default router;