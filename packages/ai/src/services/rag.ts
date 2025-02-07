// packages/api/src/services/rag.ts
import { OllamaService } from './ollama';
import { QdrantService } from './qdrant';
import { ModelConfig, DEFAULT_MODEL } from '../config/models';
import { v4 as uuidv4 } from 'uuid';

export class RAGService {
  private ollama: OllamaService;
  private qdrant: QdrantService;
  private currentModel: ModelConfig;

  constructor(model?: ModelConfig) {
    this.currentModel = model || DEFAULT_MODEL;
    this.ollama = new OllamaService(undefined, this.currentModel);
    this.qdrant = new QdrantService(undefined, this.currentModel);
  }

  async addDocument(collectionName: string, text: string) {
    const embedding = await this.ollama.generateEmbedding(text);
    await this.qdrant.upsertDocuments(collectionName, [{
      id: uuidv4(),
      text,
      embedding
    }]).catch(error => {
      console.error('Error adding document:', error);
      throw error;
    });
  }

  async query(collectionName: string, question: string): Promise<string> {
    // Generate embedding for the question
    const questionEmbedding = await this.ollama.generateEmbedding(question);
    
    // Search similar documents
    const similarDocs = await this.qdrant.search(collectionName, questionEmbedding);
    
    // Prepare context from similar documents
    const context = similarDocs.map(doc => doc.text).join('\n\n');
    
    // Generate answer using the context
    return await this.ollama.generateCompletion(question, context);
  }

  setModel(model: ModelConfig, collectionName: string) {
    this.currentModel = model;
    this.qdrant.setModel(model);
    this.qdrant.initializeCollection(collectionName)
    this.ollama.setModel(model);
  }
}