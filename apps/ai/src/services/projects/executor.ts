import EventEmitter from "events";
import { FirebaseCoordinator } from "./firebase-coordinator";
import { ProjectService, projectService } from "./project.service";
import { Commands, Project } from "../../models";
import { RAGService, ragService } from "../ai/rag";
import { OllamaService, ollamaService } from "../ai/ollama";

export class ExecutorService {

   private coordinator: FirebaseCoordinator;
   private projectService: ProjectService;
   private ragService: RAGService;
   private ollamaService: OllamaService;

   private commandEmitter: EventEmitter
   private aiModelEmiiter: EventEmitter;

   constructor() {
      this.coordinator = new FirebaseCoordinator();
      this.projectService = projectService;
      this.ragService = ragService
      this.ollamaService = ollamaService;

      this.commandEmitter = this.coordinator.createEmitter('command');
      this.aiModelEmiiter = this.coordinator.createEmitter('ai-model');

      this.commandEmitter.on('data', (data) => {
         this.executeCommand(data);
      });

      this.aiModelEmiiter.on('data', (data) => {
         this.executeAICommand(data);
      });
   }

   private executeCommand(data: any) {
      switch (data['command'] as Commands) {
         case Commands.CREATE_PROJECT:
            this.projectService.createProject(data['project'] as Project);
            break;
         case Commands.DELETE_PROJECT:
            this.projectService.deleteProject(data['projectId']);
            break;
         case Commands.UPLOAD_FILE:
            this.projectService.uploadFile(data['projectId'], data['file']);
            break;
         case Commands.DELETE_FILE:
            this.projectService.deleteFile(data['projectId'], data['fileId']);
            break;
         case Commands.DOWNLOAD_FILE:
            this.projectService.downloadFile(data['projectId'], data['fileId']);
            break;
         case Commands.GET_PROJECT_FILES:
            this.projectService.getProjectFiles(data['projectId']);
            break;
         case Commands.GET_PROJECTS:
            this.projectService.getProjects();
            break;
         case Commands.GET_PROJECT:
            this.projectService.getProject(data['projectId']);
            break;
      }
   }

   private async executeAICommand(data: any) {
      switch (data['command'] as Commands) {
         case Commands.GET_AI_MODELS:
            const models = this.ollamaService.getAvailableModels();
            this.coordinator.publish(models);
            break;
         case Commands.SET_AI_MODEL: {
            const { modelName, collection } = data;
            const modelsAvailable = await this.ollamaService.getModelsWithDetails();
            const model = modelsAvailable.available.find((model) => model.name === modelName);
            if (!model) {
               this.coordinator.publish({ error: 'Model not found' });
               return;
            }
            this.ragService.setModel(model, collection);
            this.coordinator.publish({ message: 'Model updated successfully', model });
            break;
         }
         case Commands.ADD_DOCUMENT_TO_RAG: {
            const { collection, text } = data;
            this.ragService.addDocument(collection, text);
            this.coordinator.publish({ message: 'Document added successfully' });
            break;
         }
         case Commands.QUERY_AI: {
            const { collection, question } = data;
            const stream = this.ragService.queryStream(collection, question);
            for await (const chunk of stream) {
               this.coordinator.publish(chunk);
            }
            break;
         }

      }
   }

}