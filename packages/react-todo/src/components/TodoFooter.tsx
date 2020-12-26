import React, { PureComponent } from 'react';
import { Todo } from '../services/todo-storage';
import { AbilityContext } from './Can';
import defineRulesFor from '../config/ability';

type Props = {
  items: Todo[]
};
type State = {
  role: string
};

const hint = 'Admin - can do anything.\nMember can read everything and manage todos with assignee "me"';

export default class TodoFooter extends PureComponent<Props, State> {
  static contextType = AbilityContext;

  state = {
    role: 'member'
  };

  get remaining() {
    return this.props.items.filter(item => !item.completed).length;
  }

  private _selectedIfRole(role: string) {
    return this.state.role === role ? 'selected' : '';
  }

  private _setRole(role: string) {
    this.context.update(defineRulesFor(role));
    this.setState({ role });
  }

  render() {
    return (
      <footer className="footer">
        <span className="todo-count"><b>{this.remaining}</b> left</span>
        <ul className="roles">
          <li className="help" title={hint}>Switch roles:</li>
          <li>
            <button type="button" className={this._selectedIfRole('admin')} onClick={this._setRole.bind(this, 'admin')}>
              Admin
            </button>
          </li>
          <li>
            <button type="button" className={this._selectedIfRole('member')} onClick={this._setRole.bind(this, 'member')}>
              Member
            </button>
          </li>
        </ul>
      </footer>
    )
  }
};
