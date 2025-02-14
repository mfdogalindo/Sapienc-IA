// apps/ai/src/index.ts
import express from 'express';

import router from './controllers/Router';

import ExecutorService from './services/executor';
import { exec } from 'child_process';

const executorService = new ExecutorService();

executorService.setup();

const app = express();
app.use(express.json());

app.use(router);

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
   console.log(`FireBase Bridge Service running on port ${PORT}`);
});