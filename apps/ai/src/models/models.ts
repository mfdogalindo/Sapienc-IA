// apps/api/src/models/models.ts
export interface ModelConfig {
   name: string;
   embedSize: number;
   contextWindow: number;
   description: string;
 }
 
 export const DEFAULT_MODEL: ModelConfig = {
   name: "llama3:latest",
   embedSize: 4096,
   contextWindow: 8192,
   description: "Meta's Llama 3.1 model"
 };
