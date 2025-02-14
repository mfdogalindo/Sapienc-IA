import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { appConfig } from '../config/app.config';

// Interfaz para métodos de logging
interface ILogger {
   error(message: string, meta?: any): void;
   warn(message: string, meta?: any): void;
   info(message: string, meta?: any): void;
   debug(message: string, meta?: any): void;
   http(message: string, meta?: any): void;
}

// Interfaz para la configuración del logger
interface LoggerConfig {
   level: string;
   logsDir: string;
   serviceName: string;
   environment: string;
}

export class Logger implements ILogger {
   private logger: winston.Logger;
   private config: LoggerConfig;

   constructor(config: LoggerConfig) {
      this.config = config;
      this.logger = this.createLogger();
   }

   private createLogger(): winston.Logger {
      const { format } = winston;
      const { combine, timestamp, printf, colorize } = format;

      // Formato personalizado para los logs
      const logFormat = printf(({ level, message, timestamp, ...meta }) => {
         return JSON.stringify({
            timestamp,
            level,
            service: this.config.serviceName,
            environment: this.config.environment,
            message,
            ...meta
         });
      });

      // Configuración de transports
      const transports: winston.transport[] = [
         // Logs de consola para desarrollo
         new winston.transports.Console({
            format: combine(
               colorize(),
               timestamp(),
               printf(({ level, message, timestamp, ...meta }) => {
                  return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                     }`;
               })
            )
         }),

         // Logs de errores en archivo
         new DailyRotateFile({
            filename: `${this.config.logsDir}/error-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d'
         }),

         // Logs generales en archivo
         new DailyRotateFile({
            filename: `${this.config.logsDir}/combined-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
         })
      ];

      return winston.createLogger({
         level: this.config.level,
         format: combine(timestamp(), logFormat),
         transports
      });
   }

   // Métodos para diferentes niveles de log
   error(message: string, meta: any = {}): void {
      this.logger.error(message, meta);
   }

   warn(message: string, meta: any = {}): void {
      this.logger.warn(message, meta);
   }

   info(message: string, meta: any = {}): void {
      this.logger.info(message, meta);
   }

   debug(message: string, meta: any = {}): void {
      this.logger.debug(message, meta);
   }

   http(message: string, meta: any = {}): void {
      this.logger.http(message, meta);
   }

}


// Export singleton
export const logger = new Logger({
   level: appConfig.loggerLevel,
   logsDir: 'logs',
   serviceName: 'firebase-adapter',
   environment: appConfig.environment
});