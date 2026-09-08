import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

/**
 * Displays the list of todos with loading, error and empty states, and
 * inline actions for completion toggling and deletion.
 *
 * State is held in signals so change detection runs correctly in this
 * zoneless application (there is no zone.js to trigger it after async work).
 */
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList implements OnInit, OnDestroy {
  private readonly todoService = inject(TodoService);

  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly unreadCount = signal(0);

  private pollHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.load();
    this.loadUnreadCount();
    // Poll the unread notification count so the bell badge stays current as the
    // "notifier" Kafka consumer writes new notifications on the backend.
    this.pollHandle = setInterval(() => this.loadUnreadCount(), 10000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
    }
  }

  private loadUnreadCount(): void {
    this.todoService.getUnreadNotificationCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos.set(this.sortByCreatedAtDesc(todos));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load todos. Please try again.');
        this.loading.set(false);
      },
    });
  }

  toggleCompleted(todo: Todo): void {
    this.todoService.setCompleted(todo.id, !todo.completed).subscribe({
      next: (updated) => {
        this.todos.update((list) =>
          list.map((t) => (t.id === updated.id ? updated : t)),
        );
      },
      error: () => {
        this.errorMessage.set('Unable to update the todo. Please try again.');
      },
    });
  }

  deleteTodo(todo: Todo): void {    const confirmed = confirm(`Delete "${todo.title}"?`);
    if (!confirmed) {
      return;
    }
    this.todoService.delete(todo.id).subscribe({
      next: () => {
        this.todos.update((list) => list.filter((t) => t.id !== todo.id));
      },
      error: () => {
        this.errorMessage.set('Unable to delete the todo. Please try again.');
      },
    });
  }

  /**
   * Returns a new array sorted by creation date, newest first.
   */
  private sortByCreatedAtDesc(todos: Todo[]): Todo[] {
    return [...todos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
