export class APIService {
   private baseUrl: string;

   constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
   }

   // Get with ouput type T template
   async get<T>(path: string): Promise<T> {
      const response = await fetch(`${this.baseUrl}/${path}`);
      return response.json();
   }

   // Post with input type T template
   async post<T>(path: string, data: T): Promise<void> {
      await fetch(`${this.baseUrl}/${path}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });
   }

   // Put with input type T template
   async put<T>(path: string, data: T): Promise<void> {
      await fetch(`${this.baseUrl}/${path}`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });
   }

   // Delete
   async delete(path: string): Promise<void> {
      await fetch(`${this.baseUrl}/${path}`, {
         method: 'DELETE',
      });
   }
}