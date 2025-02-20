export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  url?: string;
  path?: string;
}

export interface FileWithMetadata extends FileMetadata {
  data: string;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  messages: Message[];
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  objective: string;
  chats: Chat[];
  files: FileMetadata[];
  createdAt: number;
  updatedAt: number;
}


export type ProjectCreate = Partial<Pick<Project, 'name' | 'description' | 'objective'>>;