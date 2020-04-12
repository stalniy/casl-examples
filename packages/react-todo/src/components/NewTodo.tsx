import React, { PureComponent } from 'react';

type Todo = { title: string, assignee: string };
type State = Readonly<Todo>;
type Props = {
  onNewTodo: (todo: Todo) => void
};

export default class NewTodo extends PureComponent<Props, State> {
  state = {
    title: '',
    assignee: ''
  };

  private _updateTodoTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  }

  private _updateTodoAssignee = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ assignee: event.target.value });
  }

  private _addTodo = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode !== 13) {
      return;
    }

    this.props.onNewTodo({ ...this.state });
    this.setState({ title: '', assignee: '' });
  }

  render() {
    return (
      <div className="new-todo">
        <input
          name="title"
          autoFocus
          autoComplete="off"
          placeholder="What needs to be done?"
          value={this.state.title}
          onChange={this._updateTodoTitle}
          onKeyUp={this._addTodo} />

        <select name="assignee" value={this.state.assignee} onChange={this._updateTodoAssignee}>
          <option value="" disabled>Choose Assignee</option>
          <option>me</option>
          <option>John Doe</option>
          <option>Alex Pupkin</option>
        </select>
      </div>
    );
  }
}
