import { Todo, TodoInput } from '../models/Todo';

const STORAGE_KEY = 'casl-vue-todos';
let todoId = 0;

export default {
  build(attrs: Todo | TodoInput): Todo {
    return {
      completed: false,
      ...attrs,
      kind: 'Todo',
      id: ++todoId,
    };
  },

  fetch(): Todo[] {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Todo[];
    return items.map(item => this.build(item));
  },

  save(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};
