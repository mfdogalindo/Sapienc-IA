import { ProjectService } from "../services/projects/project.service";
import { Request, Response } from 'express';

export class ProjectsController{
   private projectService : ProjectService;

   constructor(){
      this.projectService = new ProjectService();
   }

   public getProjects = async (req: Request, res: Response) => {
      try {
         const projects = await this.projectService.getProjects();
         res.json(projects);
      } catch (error) {
         console.error('Error fetching projects:', error);
         res.status(500).json({
            error: 'Failed to fetch projects',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public createProject = async (req: Request, res: Response) => {
      const project = req.body;

      try {
         const newProject = await this.projectService.createProject(project);
         res.json(newProject);
      } catch (error) {
         console.error('Error creating project:', error);
         res.status(500).json({
            error: 'Failed to create project',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public getProject = async (req: Request, res: Response) => {
      const { projectId } = req.params;

      try {
         const project = await this.projectService.getProject(projectId);
         if (!project) {
            return res.status(404).json({ error: 'Project not found' });
         }
         res.json(project);
      } catch (error) {
         console.error('Error fetching project:', error);
         res.status(500).json({
            error: 'Failed to fetch project',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public deleteProject = async (req: Request, res: Response) => {
      const { projectId } = req.params;

      try {
         await this.projectService.deleteProject(projectId);
         res.json({ message: 'Project deleted successfully' });
      } catch (error) {
         console.error('Error deleting project:', error);
         res.status(500).json({
            error: 'Failed to delete project',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public uploadFile = async (req: Request, res: Response) => {
      const { projectId } = req.params;
      const file : FileUpload = req.file;

      try {
         const fileMetadata = await this.projectService.uploadFile(projectId, file);
         res.json(fileMetadata);
      } catch (error) {
         console.error('Error uploading file:', error);
         res.status(500).json({
            error: 'Failed to upload file',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public getProjectFiles = async (req: Request, res: Response) => {
      const { projectId } = req.params;

      try {
         const files = await this.projectService.getProjectFiles(projectId);
         res.json(files);
      } catch (error) {
         console.error('Error fetching project files:', error);
         res.status(500).json({
            error: 'Failed to fetch project files',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public deleteFile = async (req: Request, res: Response) => {
      const { projectId, fileId } = req.params;

      try {
         await this.projectService.deleteFile(projectId, fileId);
         res.json({ message: 'File deleted successfully' });
      } catch (error) {
         console.error('Error deleting file:', error);
         res.status(500).json({
            error: 'Failed to delete file',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public downloadFile = async (req: Request, res: Response) => {
      const { projectId, fileId } = req.params;

      try {
         const file = await this.projectService.downloadFile(projectId, fileId);
         res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`);
         res.send(file);
      } catch (error) {
         console.error('Error downloading file:', error);
         res.status(500).json({
            error: 'Failed to download file',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

}