const STORAGE_KEY = 'todos-react';
let uid = 0;

export interface Todo {
  type: 'Todo';
  id: number;
  title: string;
  assignee: string;
  completed: boolean;
}

type TodoInput = Pick<Todo, 'title' | 'assignee'> & { completed?: boolean };

export default {
  build(attrs: TodoInput): Todo {
    return {
      completed: false,
      ...attrs,
      type: 'Todo',
      id: ++uid
    };
  },

  fetch(): Todo[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [
        this.build({
          title: 'Explore what CASL can do',
          assignee: 'me',
          completed: true
        }),
        this.build({
          title: 'Define permissions for your next big idea',
          assignee: 'me'
        }),
        this.build({
          title: 'Try switching between Member and Admin',
          assignee: 'John Doe'
        }),
        this.build({
          title: 'Ship authorization with confidence',
          assignee: 'Alex Pupkin'
        })
      ];
    }
    const items = JSON.parse(saved) as Todo[];
    const lastItem = items[items.length - 1];

    if (lastItem) {
      uid = lastItem.id;
    }

    return items;
  },

  save(todos: Todo[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};
