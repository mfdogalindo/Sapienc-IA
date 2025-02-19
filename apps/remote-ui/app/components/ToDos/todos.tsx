import { Form, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { TodoItem } from "./todo-item";
import { useProject } from "~/context/ProjectContext";
import { Todos } from "server/models";

// Componente principal: se renderiza en el cliente
export default function TodosComponent() {
   // Obtiene los datos iniciales desde el loader
   const { todos: initialTodos, userId } = useLoaderData<{ todos: Todos; userId: string }>();
   const { selectedProject } = useProject();
   const [todos, setTodos] = useState<Todos>(initialTodos);
   const navigation = useNavigation();
   const isSubmitting = navigation.state === "submitting";
 
   // useFetcher se usará para el polling: cada 5 segundos se consulta el servidor
   const fetcher = useFetcher<{ todos: Todos; userId: string }>();

   useEffect(() => {
       // Carga los datos iniciales
       fetcher.load(`${window.location.pathname}?project=${selectedProject?.id}`);
    }, []);
    
 
   useEffect(() => {
     const intervalId = setInterval(() => {
       // Vuelve a cargar la data usando la ruta actual
       fetcher.load(`${window.location.pathname}?project=${selectedProject?.id}`);
     }, 1000); // cada 5 segundos
 
     return () => clearInterval(intervalId);
   }, [fetcher]);
 
   // Actualiza el estado cuando se obtienen nuevos datos
   useEffect(() => {
     if (fetcher.data) {
       setTodos(fetcher.data.todos);
     }
   }, [fetcher.data]);
 
   return (
     <div className="app-container">
       <div className="max-w-4xl mx-auto p-6">
         <div className="bg-zinc-600 rounded-lg shadow-xl p-6 mb-6">
           <Form method="post" className="flex gap-4">
             <input type="hidden" name="projectId" value={selectedProject?.id} />
             <input
               type="text"
               name="text"
               placeholder="What needs to be done?"
               className="flex-1 px-4 py-2 text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
               required
               disabled={isSubmitting}
             />
             <input type="hidden" name="_action" value="add" />
             <button
               type="submit"
               className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none 
                 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
               disabled={isSubmitting}
             >
               Add Todo
             </button>
           </Form>
         </div>
 
         <div className={`space-y-4 transition-opacity ${isSubmitting ? "opacity-50" : "opacity-100"}`}>
           {Object.entries(todos)
             .sort(([, a], [, b]) => b.createdAt - a.createdAt)
             .map(([id, todo]) => (
               <TodoItem key={id} id={id} todo={todo} isSubmitting={isSubmitting} projectId={selectedProject!.id} />
             ))}
         </div>
       </div>
     </div>
   );
 }