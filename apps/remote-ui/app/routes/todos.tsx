// app/routes/todos.tsx
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { requireUser } from "server/session.server";
import { addTodo, deleteTodo, getTodos, toggleTodo } from "server/database/todos-db.server";

// Tipos
type Todo = {
  text: string;
  completed: boolean;
  createdAt: number;
};

type Todos = {
  [key: string]: Todo;
};

// Loader: se ejecuta en el servidor y consulta Firebase
export async function loader({ request }: { request: Request }) {
  // En un caso real, obtendrías el userId de la sesión
  const user = await requireUser(request);
  const userId = user.uid;
  const todos = await getTodos(userId);
  return json({ todos, userId });
}

// Action: para agregar, toggle y eliminar todos
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("_action");
  // En un caso real, obtendrías el userId de la sesión
  const user = await requireUser(request);
  const userId = user.uid;

  try {
    switch (action) {
      case "add": {
        const text = formData.get("text") as string;
        await addTodo(userId, text);
        break;
      }
      case "toggle": {
        const id = formData.get("id") as string;
        const completed = formData.get("completed") === "true";
        await toggleTodo(userId, id, completed);
        break;
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteTodo(userId, id);
        break;
      }
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to process action" }, { status: 500 });
  }
}

// Componente para cada Todo
function TodoItem({ id, todo, isSubmitting }: { id: string; todo: Todo; isSubmitting: boolean }) {
  return (
    <div className="bg-zinc-100 rounded-lg shadow p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Form method="post" className="flex items-center">
          <input type="hidden" name="_action" value="toggle" />
          <input type="hidden" name="id" value={id} />
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

// Componente principal: se renderiza en el cliente
export default function Todos() {
  // Obtiene los datos iniciales desde el loader
  const { todos: initialTodos, userId } = useLoaderData<{ todos: Todos; userId: string }>();
  const [todos, setTodos] = useState<Todos>(initialTodos);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // useFetcher se usará para el polling: cada 5 segundos se consulta el servidor
  const fetcher = useFetcher<{ todos: Todos; userId: string }>();

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Vuelve a cargar la data usando la ruta actual
      fetcher.load(window.location.pathname);
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
            <input
              type="text"
              name="text"
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              <TodoItem key={id} id={id} todo={todo} isSubmitting={isSubmitting} />
            ))}
        </div>
      </div>
    </div>
  );
}
