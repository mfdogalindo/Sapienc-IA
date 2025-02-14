// apps/ai/src/services/firebase-storage.ts
import { storage, db, auth } from '../config/firebase-config';
import { Project, FileMetadata, FileUpload } from '../models';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ref as dbRef, set, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export class FirebaseStorageService {


  async createProject(input: Project): Promise<Project> {
    const projectId = uuidv4();
    const project: Project = {
      id: projectId,
      name: input.name,
      description: input.description,
      files: [],
      chats: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await set(dbRef(db, `projects/${projectId}`), project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    const snapshot = await get(dbRef(db, 'projects'));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  }

  async getProject(projectId: string): Promise<Project | null> {
    const snapshot = await get(dbRef(db, `projects/${projectId}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

  async deleteProject(projectId: string): Promise<void> {
    await set(dbRef(db, `projects/${projectId}`), null);
  }

  async uploadFile(projectId: string, file: FileUpload): Promise<FileMetadata> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const fileId = uuidv4();
    const filePath = `projects/${projectId}/${fileId}-${file.originalname}`;
    const fileRef = storageRef(storage, filePath);

    // Upload file to Firebase Storage
    await uploadBytes(fileRef, file.buffer, {
      contentType: file.mimetype
    });

    // Get the download URL
    const url = await getDownloadURL(fileRef);

    // Create file metadata
    const fileMetadata: FileMetadata = {
      id: fileId,
      name: file.originalname,
      path: filePath,
      type: file.mimetype,
      size: file.buffer.length,
      uploadedAt: Date.now(),
      url
    };

    console.log('current project:', project);
    console.log('File metadata:', fileMetadata);

    if(project.files === undefined){
      project.files = [];
    }

    // Update project with new file
    project.files.push(fileMetadata);
    project.updatedAt = Date.now();

    // Update project in Realtime Database
    await set(dbRef(db, `projects/${projectId}`), project);

    return fileMetadata;
  }

  async getProjectFiles(projectId: string): Promise<FileMetadata[]> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project.files;
  }

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Find and remove file from project
    const fileIndex = project.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error('File not found in project');
    }

    const file = project.files[fileIndex];
    
    // Delete from Storage
    const fileRef = storageRef(storage, file.path);
    await deleteObject(fileRef);

    // Update project
    project.files.splice(fileIndex, 1);
    project.updatedAt = Date.now();
    
    // Update in Realtime Database
    await set(dbRef(db, `projects/${projectId}`), project);
  }

  async downloadFile(projectId: string, fileId: string): Promise<Buffer> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const file = project.files.find(f => f.id === fileId);
    if (!file) {
      throw new Error('File not found in project');
    }

    const fileRef = storageRef(storage, file.path);
    const url = await getDownloadURL(fileRef);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

}