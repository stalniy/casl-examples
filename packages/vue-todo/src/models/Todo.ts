export interface Todo {
  type: 'Todo'
  id: number
  title: string
  assignee: string
  completed: boolean
}

export type TodoInput = Pick<Todo, 'title' | 'assignee'> & { completed?: boolean };
