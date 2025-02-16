export interface FileMetadata {
   id: string;
   name: string;
   path: string;
   type: string;
   size: number;
   uploadedAt: number;
   url: string;
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
   chats: Chat[];
   files: FileMetadata[];
   createdAt: number;
   updatedAt: number;
 }
 