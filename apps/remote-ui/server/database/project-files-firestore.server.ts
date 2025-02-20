//import { storage } from '../firebase/firebase.server';
//import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { database } from '../firebase/firebase.server';
import { collection, addDoc, deleteDoc, doc, query, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase.server';
import { ref as dbRef, update, get } from 'firebase/database';
import { FileMetadata, FileWithMeta, FileWithMetadata } from '../models';

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    file.arrayBuffer().then((buffer) => {
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      resolve(base64);
    });
  });
};

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

// Maximum file size (1MB)
export const MAX_FILE_SIZE = 1 * 1024 * 1024;

export async function uploadProjectFile(
  projectId: string,
  uploadedFile: File
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

  try {

    const base64Data = await convertToBase64(uploadedFile);

    const newFile = {
      name: fileName,
      type: fileType,
      size: uploadedFile.size,
      data: base64Data,
      timestamp: Date.now()
    }

    const docStored = await addDoc(collection(firestore, `projects/${projectId}/files`), newFile);

    const fileMetadata: FileMetadata = {
      id: docStored.id,
      name: fileName,
      type: fileType,
      size: uploadedFile.size,
      uploadedAt: Date.now()
    }

    // Update project's files in the database
    const projectRef = dbRef(database, `projects/${projectId}`);

    // Get list of existing files
    const snapshot = await get(projectRef);
    const project = snapshot.exists() ? snapshot.val() : {};
    const existingFiles = project.files ? Object.values(project.files) : [];
    const newList = existingFiles.concat(fileMetadata);
    project.files = newList;

    await update(projectRef, project);

    return fileMetadata;
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
}

export async function getFileMetadata(projectId: string, fileId: string): Promise<FileMetadata> {
  const filesRef = dbRef(database, `projects/${projectId}/files`);
  const snapshot = await get(filesRef);

  if (!snapshot.exists()) {
    throw new Error('File not found');
  }

  const files = snapshot.val() as FileMetadata[];
  const file = files.find(file => file?.id === fileId);

  if (!file) {
    throw new Error('File not found');
  }

  return file;
}

export async function getFileContent(projectId: string, fileId: string): Promise<string> {
  const fileDoc = await getDoc(doc(firestore, `projects/${projectId}/files/${fileId}`));

  if (!fileDoc.exists()) {
    throw new Error('File not found');
  }

  const fileDataB64 = fileDoc.data();
  const fileData = atob(fileDataB64.data);
  return fileData;
  
}

export async function getFileWithMetadata(projectId: string, fileId: string): Promise<FileWithMetadata> {
  const file = await getFileMetadata(projectId, fileId);
  const fileDoc = await getDoc(doc(firestore, `projects/${projectId}/files/${fileId}`));

  if (!fileDoc.exists()) {
    throw new Error('File not found');
  }

  const fileDataB64 = fileDoc.data();
  const fileData = atob(fileDataB64.data);
  return { ...file, data: fileData };
}

export async function deleteProjectFile(projectId: string, fileId: string): Promise<void> {
  // Get file metadata from the database
  const filesRef = dbRef(database, `projects/${projectId}/files`);
  const snapshot = await get(filesRef);

  if (!snapshot.exists()) {
    throw new Error('Files not found');
  }

  const fileMetadata = snapshot.val() as FileMetadata[];
  const fileToDelete = fileMetadata.find(file => file?.id === fileId);

  if (!fileToDelete) {
    throw new Error('File not found');
  }

  // Delete the file from firestore
  await deleteDoc(doc(firestore, `projects/${projectId}/files/${
    fileId
  }`));

  // Remove file metadata from the database
  await update(dbRef(database, `projects/${projectId}`), {
    files: fileMetadata.filter(file => file?.id !== fileId)
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