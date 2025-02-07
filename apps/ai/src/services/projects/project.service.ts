import { FirebaseStorageService } from "./firebase-client";

export class ProjectService {
   private firebaseSS : FirebaseStorageService;

   constructor(){
      this.firebaseSS = new FirebaseStorageService();
   }

   async getProjects() : Promise<Project[]>{
      return await this.firebaseSS.getProjects();
   }

   async createProject(project) : Promise<Project>{
      return await this.firebaseSS.createProject(project);
   }

   async getProject(projectId) : Promise<Project | null> {
      return await this.firebaseSS.getProject(projectId);
   }

   async uploadFile(projectId, file: FileUpload) : Promise<FileMetadata>{
      return await this.firebaseSS.uploadFile(projectId, file);
   }

   async deleteProject(projectId) : Promise<void>{
      return await this.firebaseSS.deleteProject(projectId);
   }

   async deleteFile(projectId, fileId) : Promise<void>{
      return await this.firebaseSS.deleteFile(projectId, fileId);
   }

   async downloadFile(projectId, fileId) : Promise<Buffer>{
      return await this.firebaseSS.downloadFile(projectId, fileId);
   }

   async getProjectFiles(projectId) : Promise<FileMetadata[]>{
      return await this.firebaseSS.getProjectFiles(projectId);
   }
}