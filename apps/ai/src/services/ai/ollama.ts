// apps/ai/src/services/ai/ollama.ts
import { ModelConfig, DEFAULT_MODEL } from '../../models/models';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export class OllamaService {
  private baseUrl: string;
  private currentModel: ModelConfig;

  constructor(baseUrl = 'http://localhost:11434', model?: ModelConfig) {
    this.baseUrl = baseUrl;
    this.currentModel = model || DEFAULT_MODEL;
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  // Función auxiliar para convertir modelo de Ollama a nuestro formato
  private convertToModelConfig(ollamaModel: OllamaModel): ModelConfig {
    // Mapa de tamaños de contexto estimados basados en el modelo
    const contextSizes: Record<string, number> = {
      'mistral': 8192,
      'llama3': 8192,
      'mixtral': 32768,
      // Podemos agregar más modelos aquí
      'default': 8192  // Tamaño por defecto si no conocemos el modelo
    };

    const embeddingsSizes : Record<string, number> = {
      'deepseek-r1': 5120,
      'default': 4096  // Tamaño por defecto si no conocemos el modelo
    };

    const modelName = ollamaModel.name.split(':')[0].toLowerCase();
    
    return {
      name: ollamaModel.name,
      embedSize: embeddingsSizes[modelName] || embeddingsSizes.default,
      contextWindow: contextSizes[modelName] || contextSizes.default,
      description: `${ollamaModel.details.family} ${ollamaModel.details.parameter_size} ${ollamaModel.details.quantization_level}`.trim()
    };
  }

  async getModelsWithDetails(): Promise<{
    default: ModelConfig;
    available: ModelConfig[];
  }> {
    const ollamaModels = await this.getAvailableModels();
    const availableModels = ollamaModels.map(model => this.convertToModelConfig(model));
    
    // Intentamos encontrar el modelo actual en la lista de modelos disponibles
    const defaultModel = availableModels.find(model => 
      model.name.startsWith(DEFAULT_MODEL.name)
    ) || DEFAULT_MODEL;

    return {
      default: defaultModel,
      available: availableModels
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel.name,
        prompt: text
      })
    });

    const data = await response.json();
    return data.embedding;
  }

  async generateCompletion(prompt: string, context?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel.name,
        prompt: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  }

  setModel(model: ModelConfig) {
    this.currentModel = model;
  }

  async *generateCompletionStream(prompt: string, context?: string): AsyncGenerator<string> {
   const response = await fetch(`${this.baseUrl}/api/generate`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       model: this.currentModel.name,
       prompt: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt,
       stream: true
     })
   });

   if (!response.body) {
     throw new Error('No response body received');
   }

   const reader = response.body.getReader();
   const decoder = new TextDecoder();

   try {
     while (true) {
       const { done, value } = await reader.read();
       if (done) break;
       
       const chunk = decoder.decode(value);
       const lines = chunk.split('\n');
       
       for (const line of lines) {
         if (line.trim() === '') continue;
         
         try {
           const data = JSON.parse(line);
           if (data.response) {
             yield data.response;
           }
         } catch (e) {
           console.error('Error parsing JSON:', e);
         }
       }
     }
   } finally {
     reader.releaseLock();
   }
 }

}

// export singleton instance of OllamaService
export const ollamaService = new OllamaService();