import EventEmitter from "events";
import { FirebaseCoordinator } from "./firebase-coordinator";
import { ProjectService, projectService } from "./project.service";
import { Commands, Project, AvailableModel } from "../models";
import { logger } from "../utils/logger";
import { AIService } from "./ai.service";

export default class ExecutorService {

   private coordinator: FirebaseCoordinator;
   private projectService: ProjectService;
   private aiService: AIService;

   private commandEmitter: EventEmitter
   private aiModelEmiiter: EventEmitter;

   constructor() {
      
      this.projectService = projectService;
      this.aiService = new AIService();


      /*this.commandEmitter = this.coordinator.createEmitter('command');
      this.aiModelEmiiter = this.coordinator.createEmitter('ai-model');

      this.commandEmitter.on('data', (data) => {
         this.executeCommand(data);
      });

      this.aiModelEmiiter.on('data', (data) => {
         //this.executeAICommand(data);
      });*/
   }

   public async setup(){
      this.coordinator = new FirebaseCoordinator();
      await this.coordinator.loginAndSubscribe();
      logger.info('Setting up executor service...');

      logger.info('Updating AI models list...');
      let currentModels : AvailableModel = await this.aiService.getModels();
      this.coordinator.publish('ai-models', currentModels);

      logger.info('Check current model');
      let selectedModel = await this.coordinator.read('selected-model');

      if(selectedModel){
         logger.info('Selected model found, updating model...');
      }else{
         logger.info('No model selected, selecting default model...');
         this.coordinator.publish('selected-model', currentModels.default);
      }

      

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



}