const STORAGE_KEY = 'todos-react'
let uid = 0

export interface Todo {
  type: 'Todo'
  id: number
  title: string
  assignee: string
  completed: boolean
}

type TodoInput = Pick<Todo, 'title' | 'assignee'> & { completed?: boolean };

export default {
  build(attrs: TodoInput) : Todo {
    return {
      completed: false,
      ...attrs,
      type: 'Todo',
      id: ++uid
    }
  },

  fetch(): Todo[] {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const lastItem = items[items.length - 1]

    if (lastItem) {
      uid = lastItem.id
    }

    return items
  },

  save(todos: Todo[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}
