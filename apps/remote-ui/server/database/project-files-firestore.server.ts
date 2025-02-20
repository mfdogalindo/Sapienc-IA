//import { storage } from '../firebase/firebase.server';
//import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { database } from '../firebase/firebase.server';
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase.server';
import { ref as dbRef, update, get } from 'firebase/database';
import { FileMetadata, FileWithMetadata } from '../models';

const convertToBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(buffer);
  // Usamos un TextEncoder para asegurar que los caracteres especiales se manejen correctamente
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(text);

  // Convertimos los bytes UTF-8 a base64
  let binary = '';
  const bytes = new Uint8Array(utf8Bytes);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};


const base64ToText = (base64: string): string => {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (e) {
    console.error('Error decodificando base64:', e);
    throw new Error('Error decodificando el contenido del archivo');
  }
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

function validateFile(uploadedFile: File): { fileName: string, fileType: string } {
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

  return { fileName, fileType };
}

export async function updateFile(projectId: string, fileId: string, uploadedFile: File): Promise<FileMetadata> {
  const { fileName, fileType } = validateFile(uploadedFile);

  try {
    const base64Data = await convertToBase64(uploadedFile);

    // Compute file size  and update the file in the database
    const estimatedSize = (4 * Math.ceil(base64Data.length / 3)) & ~3;
    if (estimatedSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const updatedFile = {
      name: fileName,
      type: fileType,
      size: estimatedSize,
      data: base64Data,
      timestamp: Date.now()
    };

    await updateDoc(doc(firestore, `projects/${projectId}/files/${fileId}`), updatedFile);

    // Update file metadata in the database
    const fileRef = dbRef(database, `projects/${projectId}/files/${fileId}`);
    const snapshot = await get(fileRef);
    const fileMetadata = snapshot.val() as FileMetadata;

    fileMetadata.size = estimatedSize;

    await update(fileRef, fileMetadata);
    return fileMetadata;
  } catch (error) {
    throw new Error(`Error updating file: ${error.message}`);
  }
}


export async function uploadProjectFile(
  projectId: string,
  uploadedFile: File
): Promise<FileMetadata> {

  const { fileName, fileType } = validateFile(uploadedFile);

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
    const snapshot = await get(projectRef);

    if (!snapshot.exists()) {
      throw new Error('Project not found');
    }

    const project = snapshot.val();
    const fileId = docStored.id;
    if (!project.files) {
      project.files = {};
    }

    project.files[fileId] = fileMetadata;


    await update(projectRef, project);

    return fileMetadata;
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
}

export async function getFileMetadata(projectId: string, fileId: string): Promise<FileMetadata> {
  const fileRef = dbRef(database, `projects/${projectId}/files/${fileId}`);
  const snapshot = await get(fileRef);

  if (!snapshot.exists()) {
    throw new Error('File not found');
  }

  const file = snapshot.val() as FileMetadata;

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
  const fileData = base64ToText(fileDataB64.data);
  return fileData;

}

export async function getFileWithMetadata(projectId: string, fileId: string): Promise<FileWithMetadata> {
  const file = await getFileMetadata(projectId, fileId);
  const fileDoc = await getDoc(doc(firestore, `projects/${projectId}/files/${fileId}`));

  if (!fileDoc.exists()) {
    throw new Error('File not found');
  }

  const fileDataB64 = fileDoc.data();
  const fileData = base64ToText(fileDataB64.data);
  return { ...file, data: fileData };
}

export async function deleteProjectFile(projectId: string, fileId: string): Promise<void> {
  // Get file metadata from the database
  const filesRef = dbRef(database, `projects/${projectId}/files/${fileId}`);
  const snapshot = await get(filesRef);

  if (!snapshot.exists()) {
    throw new Error('Files not found');
  }

  const fileToDelete = snapshot.val() as FileMetadata;

  if (!fileToDelete) {
    throw new Error('File not found');
  }

  console.log('Deleting file:', fileToDelete);

  // Delete the file from firestore
  await deleteDoc(doc(firestore, `projects/${projectId}/files/${fileId}`));

  console.log('File deleted from firestore');

  // Remove file metadata from the database
  const projectRef = dbRef(database, `projects/${projectId}`);
  const projectSnapshot = await get(projectRef);

  if (!projectSnapshot.exists()) {
    throw new Error('Project not found');
  }

  const project = projectSnapshot.val();
  delete project.files[fileId];

  await update(projectRef, project);
}

export async function getProjectFiles(projectId: string): Promise<FileMetadata[]> {
  const filesRef = dbRef(database, `projects/${projectId}/files`);
  const snapshot = await get(filesRef);

  if (!snapshot.exists()) {
    return [];
  }

  return Object.values(snapshot.val() as Record<string, FileMetadata>);
}