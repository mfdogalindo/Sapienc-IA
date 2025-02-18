import { storage } from '../firebase/firebase.server';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { database } from '../firebase/firebase.server';
import { ref as dbRef, update, get } from 'firebase/database';
import { FileMetadata } from '../models';

// Allowed file types and their extensions
export const ALLOWED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'text/javascript': ['.js', '.ts', '.jsx', '.tsx'],
  'text/markdown': ['.md'],
  'text/x-python': ['.py'],
  'application/x-yaml': ['.yml', '.yaml']
};

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadProjectFile(
  projectId: string, 
  uploadedFile: Blob
): Promise<FileMetadata> {
  // Get the file name from the File object if available
  const fileName = (uploadedFile instanceof File) ? uploadedFile.name : 'uploaded-file';
  const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
  
  // Determine the file type
  let fileType = (uploadedFile instanceof File) ? uploadedFile.type : '';
  
  // If no type is detected, try to determine it from the extension
  if (!fileType) {
    const extensionTypeMap: Record<string, string> = {
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.js': 'text/javascript',
      '.ts': 'text/javascript',
      '.jsx': 'text/javascript',
      '.tsx': 'text/javascript',
      '.md': 'text/markdown',
      '.py': 'text/x-python',
      '.yml': 'application/x-yaml',
      '.yaml': 'application/x-yaml'
    };
    fileType = extensionTypeMap[fileExtension] || 'text/plain';
  }

  // Validate file type
  const isAllowedType = Object.entries(ALLOWED_FILE_TYPES).some(([mimeType, extensions]) => 
    fileType === mimeType || extensions.includes(fileExtension)
  );

  if (!isAllowedType) {
    throw new Error(`File type not allowed. Supported extensions: ${Object.values(ALLOWED_FILE_TYPES).flat().join(', ')}`);
  }

  // Validate file size
  if (uploadedFile.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Create a reference to the file location
  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;
  const filePath = `projects/${projectId}/${uniqueFileName}`;
  const fileRef = ref(storage, filePath);

  try {
    // Convert File/Blob to ArrayBuffer for upload
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const uploadResult = await uploadBytes(fileRef, new Uint8Array(arrayBuffer));
    const downloadURL = await getDownloadURL(fileRef);

    // Create file metadata
    const fileMetadata: FileMetadata = {
      id: uploadResult.metadata.generation,
      name: fileName,
      path: filePath,
      type: fileType,
      size: uploadedFile.size,
      uploadedAt: timestamp,
      url: downloadURL
    };

    // Update project's files in the database
    const projectRef = dbRef(database, `projects/${projectId}`);
    
    // Get list of existing files
    const snapshot = await get(projectRef);
    const project = snapshot.exists() ? snapshot.val() : {};
    const existingFiles = project.files ? Object.values(project.files) : [];
    const newList = existingFiles.concat(fileMetadata);
    project.files = newList;

    console.log('Updating project files:', project);

    await update(projectRef, project);

    return fileMetadata;
  } catch (error) {
    // If upload fails, attempt to clean up
    try {
      await deleteObject(fileRef);
    } catch (cleanupError) {
      console.error('Error cleaning up failed upload:', cleanupError);
    }
    throw new Error(`Error uploading file: ${error.message}`);
  }
}

export async function getFileContent(projectId: string, fileId: string): Promise<string> {
  const fileRef = dbRef(database, `projects/${projectId}/files/${fileId}`);
  const snapshot = await get(fileRef);
  
  if (!snapshot.exists()) {
    throw new Error('File not found');
  }

  const fileMetadata = snapshot.val() as FileMetadata;
  const response = await fetch(fileMetadata.url);
  const content = await response.text();
  return content;
}

export async function deleteProjectFile(projectId: string, fileId: string): Promise<void> {
  // Get file metadata from the database
  const filesRef = dbRef(database, `projects/${projectId}/files`);
  const snapshot = await get(filesRef);
  
  if (!snapshot.exists()) {
    throw new Error('Files not found');
  }

  const fileMetadata = snapshot.val() as FileMetadata[];
  const fileToDelete = fileMetadata.find(file => file.id === fileId);

  if (!fileToDelete) {
    throw new Error('File not found');
  }

  // Delete the file from storage
  const storageRef = ref(storage, fileToDelete.path);
  await deleteObject(storageRef);


  // Remove file metadata from the database
  await update(dbRef(database, `projects/${projectId}`), {
    files: fileMetadata.filter(file => file.id !== fileId)
  });
}

export async function getProjectFiles(projectId: string): Promise<FileMetadata[]> {
  const filesRef = dbRef(database, `projects/${projectId}/files`);
  const snapshot = await get(filesRef);
  
  if (!snapshot.exists()) {
    return [];
  }

  return Object.values(snapshot.val() as Record<string, FileMetadata>);
}