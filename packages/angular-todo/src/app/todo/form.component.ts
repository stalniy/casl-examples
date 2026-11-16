import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { TodoInput } from '../../models/Todo';

@Component({
  selector: 'todo-form',
  standalone: false,
  template: `
    <form class="new-todo" (ngSubmit)="addTodo()">
      <span class="add-symbol" aria-hidden="true">＋</span>
      <input name="title" aria-label="Task title" autofocus autocomplete="off" placeholder="What needs to be done?"
        [ngModel]="newTodo().title" (ngModelChange)="updateTitle($event)"
        (keydown.enter)="$event.preventDefault()" (keyup.enter)="addTodo()">
      <select name="assignee" aria-label="Assign task to" [ngModel]="newTodo().assignee" (ngModelChange)="updateAssignee($event)">
        <option value="" disabled>Choose Assignee</option><option>me</option><option>John Doe</option><option>Alex Pupkin</option>
      </select>
      <button class="add-button" type="submit" [disabled]="!newTodo().title.trim() || !newTodo().assignee" aria-label="Add task">Add task <span aria-hidden="true">↗</span></button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoForm {
  readonly onNewTodo = output<TodoInput>({ alias: 'newTodo' });
  readonly newTodo = signal<TodoInput>({ title: '', assignee: '' });

  addTodo() {
    const currentTodo = this.newTodo();
    if (!currentTodo.title.trim() || !currentTodo.assignee) return;
    this.onNewTodo.emit({ ...currentTodo, title: currentTodo.title.trim() });
    this.newTodo.set({ title: '', assignee: '' });
  }

  updateTitle(title: string) {
    this.newTodo.update(todo => ({ ...todo, title }));
  }

  updateAssignee(assignee: string) {
    this.newTodo.update(todo => ({ ...todo, assignee }));
  }
}
