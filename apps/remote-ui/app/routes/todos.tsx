// app/routes/todos.tsx
import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { addTodo, deleteTodo, getTodos, toggleTodo } from "server/database/todos-db.server";
import TodosComponent from "~/components/ToDos/todos";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project");
  if (!projectId) {
    return json({
      todos: {},
      userId: user.uid,
    });
  }
  const todos = await getTodos(projectId);
  return json({ todos, projectId });
}

// Action: para agregar, toggle y eliminar todos
export async function action({ request }: { request: Request }) {
  await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("_action");
  const projectId = formData.get("projectId") as string;

  try {
    switch (action) {
      case "add": {
        const text = formData.get("text") as string;
        await addTodo(projectId, text);
        break;
      }
      case "toggle": {
        const id = formData.get("id") as string;
        const completed = formData.get("completed") === "true";
        await toggleTodo(projectId, id, completed);
        break;
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteTodo(projectId, id);
        break;
      }
    }
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to process action" }, { status: 500 });
  }
}



export default function TodosPage(){
  return <TodosComponent />
}
