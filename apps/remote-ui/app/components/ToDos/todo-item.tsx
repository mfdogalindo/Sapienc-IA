import { Form } from "@remix-run/react";
import { Todo } from "server/models";

// Componente para cada Todo
export function TodoItem({ projectId, id, todo, isSubmitting }: { projectId: string; id: string; todo: Todo; isSubmitting: boolean }) {
   return (
     <div className="bg-zinc-100 rounded-lg shadow p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
       <div className="flex items-center gap-4">
         <Form method="post" className="flex items-center">
           <input type="hidden" name="_action" value="toggle" />
           <input type="hidden" name="id" value={id} />
           <input type="hidden" name="projectId" value={projectId} />
           <input type="hidden" name="completed" value={String(todo.completed)} />
           <button
             type="submit"
             className={`w-6 h-6 rounded-full border-2 flex items-center justify-center 
               ${todo.completed ? "bg-indigo-600 border-indigo-600" : "border-gray-400"}`}
             disabled={isSubmitting}
           >
             {todo.completed && (
               <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             )}
           </button>
         </Form>
         <span className={`text-lg ${todo.completed ? "text-gray-500 line-through" : "text-gray-700"}`}>
           {todo.text}
         </span>
       </div>
 
       <Form method="post">
         <input type="hidden" name="_action" value="delete" />
         <input type="hidden" name="id" value={id} />
         <input type="hidden" name="projectId" value={projectId} />
         <button
           type="submit"
           className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
           disabled={isSubmitting}
         >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
             />
           </svg>
         </button>
       </Form>
     </div>
   );
 }