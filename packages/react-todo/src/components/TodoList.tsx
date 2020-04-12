import React, { Component } from 'react';
import todoStorage, { Todo } from '../services/todo-storage';
import NewTodo from './NewTodo';
import TodoListRenderer from './TodoListRenderer';
import TodoFooter from './TodoFooter';
import Can from './Can';

type State = {
  items: Todo[]
}

export default class TodoList extends Component<{}, State> {
  state = {
    items: todoStorage.fetch()
  };

  componentDidUpdate() {
    todoStorage.save(this.state.items);
  }

  private _addTodo = (attrs: Pick<Todo, 'assignee' | 'title'>) => {
    const todo = todoStorage.build(attrs)

    this.setState((prevState) => ({
      items: prevState.items.concat(todo)
    }))
  }

  private _removeTodo = (todo: Todo) => {
    this.setState((prevState) => ({
      items: prevState.items.filter(item => item !== todo)
    }))
  }

  private _editTodo = (todo: Todo) => {
    this.setState((prevState) => {
      const items = prevState.items.slice(0);
      const index = items.findIndex(item => item.id === todo.id);

      items.splice(index, 1, todo);

      return { items }
    });
  }

  private _completeTodo = (todo: Todo, completed: boolean) => {
    this.setState((prevState) => {
      const items = prevState.items.slice(0);
      const index = items.findIndex(item => item.id === todo.id);
      items[index] = { ...items[index], completed };
      return { items };
    });
  }

  render() {
    return (
      <div>
        <header className="header">
          <h1>Todos</h1>
          <Can do="create" on="Todo">
            <NewTodo onNewTodo={this._addTodo} />
          </Can>
        </header>
        <TodoListRenderer
          items={this.state.items}
          onRemove={this._removeTodo}
          onEdited={this._editTodo}
          onComplete={this._completeTodo}
          />
        <TodoFooter items={this.state.items} />
      </div>
    )
  }
}
