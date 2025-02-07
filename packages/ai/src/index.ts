// packages/api/src/index.ts
import express from 'express';
import { RAGService } from './services/rag';
import { OllamaService } from './services/ollama';

const app = express();
app.use(express.json());

const ragService = new RAGService();
const ollamaService = new OllamaService();
let modelsAvailable;


// API Routes
app.get('/api/models', async (req, res) => {
   try {
     const models = await ollamaService.getModelsWithDetails();
     modelsAvailable = models;
     res.json(models);
   } catch (error) {
     console.error('Error fetching models:', error);
     res.status(500).json({ 
       error: 'Failed to fetch models',
       message: error instanceof Error ? error.message : 'Unknown error'
     });
   }
 });
 

app.post('/api/model', async (req, res) => {
  const { modelName, collection } = req.body;

  if(!modelsAvailable) {
   modelsAvailable = await ollamaService.getModelsWithDetails();
  }

  const model = modelsAvailable.available.find(m => m.name === modelName);
  
  if (!model) {
    return res.status(400).json({ error: 'Model not found' });
  }

  ragService.setModel(model, collection);
  res.json({ message: 'Model updated successfully', model });
});

app.post('/api/documents', async (req, res) => {
  const { collection, text } = req.body;
  
  try {
    await ragService.addDocument(collection, text);
    res.json({ message: 'Document added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add document' });
  }
});

app.post('/api/query', async (req, res) => {
  const { collection, question } = req.body;
  
  try {
    const answer = await ragService.query(collection, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process query' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RAG Service running on port ${PORT}`);
});