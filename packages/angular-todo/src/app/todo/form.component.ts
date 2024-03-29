import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TodoInput } from '../../models/Todo';

@Component({
  selector: 'todo-form',
  template: `
    <div class="new-todo">
      <input
        name="title"
        autofocus
        autocomplete="off"
        [placeholder]="placeholder"
        [(ngModel)]="newTodo.title"
        (keyup.enter)="addTodo()">

      <select name="assignee" [(ngModel)]="newTodo.assignee">
        <option value="" disabled i18n>Choose Assignee</option>
        <option>me</option>
        <option>John Doe</option>
        <option>Alex Pupkin</option>
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoForm {
  @Output('newTodo') onNewTodo = new EventEmitter<TodoInput>();

  readonly placeholder: string = 'What needs to be done?';
  readonly newTodo: TodoInput = {
    title: '',
    assignee: ''
  };

  addTodo() {
    this.onNewTodo.emit({ ...this.newTodo  })
    this.newTodo.title = ''
    this.newTodo.assignee = ''
  }
}
