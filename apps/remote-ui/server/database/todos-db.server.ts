import { database } from '../firebase.server';
import { ref, set, push, remove, get, update } from 'firebase/database';

export async function addTodo(userId: string, text: string) {
  const todosRef = ref(database, `todos/${userId}`);
  const newTodoRef = push(todosRef);
  
  await set(newTodoRef, {
    text,
    completed: false,
    createdAt: Date.now()
  });
  
  return newTodoRef.key;
}

export async function toggleTodo(userId: string, todoId: string, completed: boolean) {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  await update(todoRef, { completed: !completed });
}

export async function deleteTodo(userId: string, todoId: string) {
  const todoRef = ref(database, `todos/${userId}/${todoId}`);
  await remove(todoRef);
}

export async function getTodos(userId: string) {
  const todosRef = ref(database, `todos/${userId}`);
  const snapshot = await get(todosRef);
  return snapshot.val() || {};
}