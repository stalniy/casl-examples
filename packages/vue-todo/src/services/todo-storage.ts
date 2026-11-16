import { Todo, TodoInput } from '../models/Todo';

const STORAGE_KEY = 'casl-vue-todos';
let todoId = 0;

export default {
  build(attrs: TodoInput): Todo {
    return {
      completed: false,
      ...attrs,
      type: 'Todo',
      id: ++todoId,
    };
  },

  fetch(): Todo[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return [
        { ...this.build({ title: 'Explore what CASL can do', assignee: 'me' }), completed: true },
        this.build({ title: 'Define permissions for your next big idea', assignee: 'me' }),
        this.build({ title: 'Try switching between Member and Admin', assignee: 'John Doe' }),
        this.build({ title: 'Ship authorization with confidence', assignee: 'Alex Pupkin' }),
      ];
    }
    const items = JSON.parse(saved) as Todo[];
    const lastItem = items[items.length - 1];

    if (lastItem) {
      todoId = lastItem.id;
    }

    return items;
  },

  save(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};
