import { OllamaService } from "../services/ai/ollama";
import { RAGService } from "../services/ai/rag";
import { Request, Response } from 'express';

export class AIController {
   private rag: RAGService;
   private ollama: OllamaService;


   constructor() {
      this.rag = new RAGService();
      this.ollama = new OllamaService();
   }

   public getModels = async (req: Request, res: Response) => {
      try {
         const models = await this.ollama.getModelsWithDetails();
         res.json(models);
      } catch (error) {
         console.error('Error fetching models:', error);
         res.status(500).json({
            error: 'Failed to fetch models',
            message: error instanceof Error ? error.message : 'Unknown error'
         });
      }
   }

   public setModel = async (req: Request, res: Response) => {
      const { modelName, collection } = req.body;

      const modelsAvailable = await this.ollama.getModelsWithDetails();
      const model = modelsAvailable.available.find(m => m.name === modelName);

      if (!model) {
         return res.status(400).json({ error: 'Model not found' });
      }

      this.rag.setModel(model, collection);
      res.json({ message: 'Model updated successfully', model });
   }

   public addDocument = async (req: Request, res: Response) => {
      const { collection, text } = req.body;

      try {
         await this.rag.addDocument(collection, text);
         res.json({ message: 'Document added successfully' });
      } catch (error) {
         res.status(500).json({ error: 'Failed to add document' });
      }
   }

   public query = async (req: Request, res: Response) => {
      const { collection, question, stream } = req.body;

      if (stream) {
         const stream = this.rag.queryStream(collection, question);
         res.setHeader('Content-Type', 'text/plain');
         res.setHeader('Transfer-Encoding', 'chunked');
         res.setHeader('Connection', 'Transfer-Encoding');
         res.setHeader('Cache-Control', 'no-cache');
         res.setHeader('Pragma', 'no-cache');
         res.setHeader('Expires', '0');

         res.write('[');
         for await (const answer of stream) {
            res.write(JSON.stringify({ answer }) + ',');
         }
         res.write(']');
         res.end();
      } else {
         try {
            const answer = await this.rag.query(collection, question);
            res.json({ answer });
         } catch (error) {
            res.status(500).json({ error: 'Failed to query' });
         }
      }
   }

}