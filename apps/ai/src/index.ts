// apps/ai/src/index.ts
import express from 'express';

import router from './controllers/Router';

const app = express();
app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
   console.log(`RAG Service running on port ${PORT}`);
});