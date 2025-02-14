// AI API client
import { APIService } from "./api.service";
import { appConfig } from "../config/app.config";
import { AvailableModel } from "../models";

export class AIService {
   private apiService: APIService;

   constructor() {
      this.apiService = new APIService(appConfig.aiApi);
   }

   getModels() : Promise<AvailableModel> {
      return this.apiService.get('models');
   }
}