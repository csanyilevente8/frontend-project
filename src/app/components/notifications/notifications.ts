import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';
import { Notification } from '../../models/todo.model';

/**
 * Read-only notifications feed. Shows notifications recorded by the backend's
 * independent "notifier" Kafka consumer group (UC2 fan-out — the same events
 * also populate the Activity view via a separate consumer group). Opening this
 * view marks notifications as read so the bell badge clears. Signals-based
 * (zoneless).
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsView implements OnInit {
  private readonly todoService = inject(TodoService);

  readonly items = signal<Notification[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
    // Opening the view clears the unread badge.
    this.todoService.markNotificationsRead().subscribe({ error: () => {} });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.todoService.getNotifications().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load notifications. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /** CSS class per event type for a coloured badge. */
  badgeClass(type: string): string {
    switch (type) {
      case 'TodoCreated':
        return 'badge created';
      case 'TodoCompleted':
        return 'badge completed';
      case 'TodoDeleted':
        return 'badge deleted';
      default:
        return 'badge';
    }
  }
}
