// apps/ai/src/services/ai/qdrant.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { ModelConfig, DEFAULT_MODEL } from '../../config/models';

export class QdrantService {
  private client: QdrantClient;
  private currentModel: ModelConfig;

  constructor(url = 'http://localhost:6333', model?: ModelConfig) {
    this.client = new QdrantClient({ url });
    this.currentModel = model || DEFAULT_MODEL;
  }

  async initializeCollection(collectionName: string) {
    // delete collection if it already exists
    try {
      await this.client.deleteCollection(collectionName);
    } catch (error) {
      // Collection might not exist
    }
    try {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: this.currentModel.embedSize,
          distance: 'Cosine'
        }
      });
    } catch (error) {
      // Collection might already exist
      console.log('Collection initialization error:', error);
    }
  }

  async upsertDocuments(collectionName: string, documents: Array<{id: string, text: string, embedding: number[]}>) {
    return await this.client.upsert(collectionName, {
      wait: true,
      points: documents.map(doc => ({
        id: doc.id,
        vector: doc.embedding,
        payload: { text: doc.text }
      }))
    });
  }

  async search(collectionName: string, embedding: number[], limit = 5) {
    const results = await this.client.search(collectionName, {
      vector: embedding,
      limit,
      with_payload: true
    });

    return results.map(result => ({
      text: result.payload?.text as string,
      score: result.score
    }));
  }

  setModel(model: ModelConfig) {
    this.currentModel = model;
  }
}