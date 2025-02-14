export interface AIModel {
   name: string;
   description: string;
   embedSize: number;
   contextWindow: number;
}

export interface AvailableModel {
   default: AIModel;
   available: AIModel[];
}