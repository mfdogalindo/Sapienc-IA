process.loadEnvFile();process.loadEnvFile();

export const appConfig = {
   aiApi : process.env.AI_API || '',
   loggerLevel : process.env.LOGGER_LEVEL || 'info',
   environment : process.env.NODE_ENV || 'development'
}