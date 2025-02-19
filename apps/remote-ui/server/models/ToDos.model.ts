export type Todo = {
  text: string;
  completed: boolean;
  createdAt: number;
};

export type Todos = {
  [key: string]: Todo;
};