import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TodoService } from '../../services/todo.service';
import { Activity } from '../../models/todo.model';

/**
 * Read-only activity feed. Shows recent todo events (created/updated/completed/
 * deleted) recorded by the backend's Kafka consumer. Loading/error/empty states,
 * signals-based (zoneless).
 */
@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class ActivityView implements OnInit {
  private readonly todoService = inject(TodoService);

  readonly items = signal<Activity[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.todoService.getActivity().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load activity. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /** CSS class per event type for a coloured badge. */
  badgeClass(type: string): string {
    switch (type) {
      case 'TodoCreated':
        return 'badge created';
      case 'TodoUpdated':
        return 'badge updated';
      case 'TodoCompleted':
        return 'badge completed';
      case 'TodoDeleted':
        return 'badge deleted';
      default:
        return 'badge';
    }
  }
}
