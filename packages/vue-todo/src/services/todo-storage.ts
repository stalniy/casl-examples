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
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Todo[];
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
