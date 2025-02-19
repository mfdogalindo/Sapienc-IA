import { database } from '../firebase/firebase.server';
import { ref, set, push, remove, get, update } from 'firebase/database';

export async function addTodo(projectId: string, text: string) {
  const todosRef = ref(database, `todos/${projectId}`);
  const newTodoRef = push(todosRef);
  
  await set(newTodoRef, {
    text,
    completed: false,
    createdAt: Date.now()
  });
  
  return newTodoRef.key;
}

export async function toggleTodo(projectId: string, todoId: string, completed: boolean) {
  const todoRef = ref(database, `todos/${projectId}/${todoId}`);
  await update(todoRef, { completed: !completed });
}

export async function deleteTodo(projectId: string, todoId: string) {
  const todoRef = ref(database, `todos/${projectId}/${todoId}`);
  await remove(todoRef);
}

export async function getTodos(projectId: string) {
  const todosRef = ref(database, `todos/${projectId}`);
  const snapshot = await get(todosRef);
  return snapshot.val() || {};
}