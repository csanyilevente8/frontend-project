import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateTodoRequest, Todo, UpdateTodoRequest, Activity, Notification } from '../models/todo.model';

/**
 * Single point of contact with the backend Todo REST API.
 * Components must not perform HTTP calls directly.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/todos`;

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl);
  }

  getById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, request);
  }

  update(id: string, request: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.baseUrl}/${id}`, request);
  }

  setCompleted(id: string, completed: boolean): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}/complete`, { completed });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Recent activity entries (populated by the backend's Kafka consumer). */
  getActivity(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${environment.apiUrl}/activity`);
  }

  /**
   * Recent notifications (populated by the backend's independent "notifier"
   * Kafka consumer group — UC2 fan-out).
   */
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`);
  }

  /** Count of unread notifications, for the bell badge. */
  getUnreadNotificationCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${environment.apiUrl}/notifications/unread-count`,
    );
  }

  /** Mark all notifications as read. */
  markNotificationsRead(): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(
      `${environment.apiUrl}/notifications/read`,
      {},
    );
  }
}
