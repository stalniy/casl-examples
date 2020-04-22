export interface Todo {
  kind: 'Todo'
  id: number
  title: string
  assignee: string
  completed?: boolean
}

export type TodoInput = Pick<Todo, 'title' | 'assignee'>;
