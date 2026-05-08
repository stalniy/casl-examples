import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TodoInput } from '../../models/Todo';

@Component({
  selector: 'todo-form',
  standalone: false,
  template: `
    <div class="new-todo">
      <input
        name="title"
        autofocus
        autocomplete="off"
        [placeholder]="placeholder"
        [ngModel]="newTodo().title"
        (ngModelChange)="updateTitle($event)"
        (keyup.enter)="addTodo()">

      <select
        name="assignee"
        [ngModel]="newTodo().assignee"
        (ngModelChange)="updateAssignee($event)">
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
  readonly onNewTodo = output<TodoInput>({ alias: 'newTodo' });

  readonly placeholder: string = 'What needs to be done?';
  readonly newTodo = signal<TodoInput>({
    title: '',
    assignee: ''
  });

  addTodo() {
    const currentTodo = this.newTodo();
    this.onNewTodo.emit({ ...currentTodo });
    this.newTodo.set({
      title: '',
      assignee: '',
    });
  }

  updateTitle(title: string) {
    this.newTodo.update(todo => ({
      ...todo,
      title,
    }));
  }

  updateAssignee(assignee: string) {
    this.newTodo.update(todo => ({
      ...todo,
      assignee,
    }));
  }
}
