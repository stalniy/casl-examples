import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbilityServiceSignal } from '@casl/angular';
import { AppAbility } from 'src/services/AppAbility';
import { Todo, TodoInput } from '../models/Todo';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="https://casl.js.org/" aria-label="CASL documentation"><img class="brand-mark" src="assets/casl-shield.png" alt="" width="35" height="42"> CASL</a>
        <div class="workspace-label">THE AUTHORIZATION PLAYGROUND</div>
        <a class="nav-item current" href="#workspace"><span aria-hidden="true">▦</span> My workspace <span class="nav-count">{{ todos().length }}</span></a>
        <a class="nav-item" href="https://casl.js.org/v6/en/guide/intro"><span aria-hidden="true">⌘</span> Explore CASL <span class="external">↗</span></a>
        <div class="sidebar-bottom">
          <div class="mini-orbit" aria-hidden="true">✳</div>
          <h3>Small rules.<br>Big possibilities.</h3>
          <p>Build permissions that grow with your ideas.</p>
          <a href="https://casl.js.org/">Meet CASL <span>↗</span></a>
          <div class="framework"><span class="angular-icon">A</span> Built with Angular <span class="status-dot"></span></div>
        </div>
      </aside>

      <div class="page">
        <header class="topbar"><div><span class="breadcrumb">Playground</span><span class="breadcrumb-slash">/</span> Todo workspace</div><a href="https://github.com/stalniy/casl">Star on GitHub <span aria-hidden="true">↗</span></a></header>
        <main id="workspace">
          <div class="page-heading"><div><div class="eyebrow"><span class="status-dot"></span> A LITTLE PRODUCTIVITY. A LOT OF POSSIBILITY.</div><h1>Your tasks. Your rules<span>.</span></h1><p>A space to get things done. Powered by permissions that make sense.</p></div><span class="edition">CASL × Angular</span></div>
          <div class="workspace-grid">
            <section class="todoapp" aria-labelledby="tasks-heading">
              <div class="section-heading"><div><span class="section-icon" aria-hidden="true">☷</span><h2 id="tasks-heading">My tasks</h2><span class="task-total">{{ todos().length }}</span></div><span class="live-label"><span class="status-dot"></span> Live playground</span></div>
              @if (can('create', 'Todo')) {
                <todo-form (newTodo)="addTodo($event)"></todo-form>
              }
              <div class="list-toolbar"><div class="filters" aria-label="Filter tasks">
                <button type="button" [class.active]="filter() === 'all'" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">All tasks <span>{{ todos().length }}</span></button>
                <button type="button" [class.active]="filter() === 'active'" [attr.aria-pressed]="filter() === 'active'" (click)="filter.set('active')">To do</button>
                <button type="button" [class.active]="filter() === 'completed'" [attr.aria-pressed]="filter() === 'completed'" (click)="filter.set('completed')">Completed</button>
              </div><span class="list-hint">Make something happen</span></div>
              <todo-list [items]="visibleTodos()" (remove)="removeTodo($event)" (change)="refreshTodos()"></todo-list>
              <div class="task-bottom"><span>{{ remaining() }} tasks left to do</span><span><span class="tiny-key">↵</span> to add · double-click a task to edit</span></div>
              <div class="playground-note"><span aria-hidden="true">ⓘ</span><p>This is your sandbox. Add a task, switch roles, and see authorization in action.<br><span>Tasks live in this session. A fresh page means a fresh start.</span></p></div>
            </section>
            <todo-footer [items]="todos()"></todo-footer>
          </div>
          <a class="promo-banner" href="https://casl.js.org/"><span class="promo-symbol" aria-hidden="true">✳</span><div><span class="eyebrow">MEET THE ENGINE BEHIND THE RULES</span><h2>Permission to build something great.</h2><p>CASL is an isomorphic authorization library for JavaScript. Simple, flexible, and made for your stack.</p></div><span class="promo-cta">Explore CASL <span>↗</span></span></a>
          <footer class="page-footer"><span>A tiny app. A powerful authorization library.</span><span>Made possible by <a href="https://casl.js.org/">CASL</a> <span class="footer-spark">✳</span></span></footer>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly abilityService = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);
  protected readonly can = this.abilityService.can;
  protected readonly todos = signal<Todo[]>([
    { kind: 'Todo', id: 1, title: 'Explore what CASL can do', assignee: 'me', completed: true },
    { kind: 'Todo', id: 2, title: 'Define permissions for your next big idea', assignee: 'me', completed: false },
    { kind: 'Todo', id: 3, title: 'Try switching between Member and Admin', assignee: 'John Doe', completed: false },
    { kind: 'Todo', id: 4, title: 'Ship something with confidence', assignee: 'Alex Pupkin', completed: false },
  ]);
  protected readonly filter = signal('all');
  protected readonly remaining = computed(() => this.todos().filter(todo => !todo.completed).length);
  protected readonly visibleTodos = computed(() => this.todos().filter(todo =>
    this.filter() === 'all' || (this.filter() === 'completed' ? todo.completed : !todo.completed)));

  addTodo(todo: TodoInput) {
    this.todos.update(items => items.concat({ ...todo, kind: 'Todo', id: Date.now(), completed: false }));
    this.filter.set('all');
  }

  refreshTodos() {
    this.todos.update(items => [...items]);
  }

  removeTodo(todoToRemove: Todo) {
    this.todos.update(items => items.filter(todo => todo !== todoToRemove));
  }
}
