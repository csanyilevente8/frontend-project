export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
}

export interface UpdateTodoRequest {
  title: string;
  description?: string | null;
  completed: boolean;
}

/** An activity-log entry, fed from Kafka events on the backend. */
export interface Activity {
  id: number;
  todoId: string;
  type: string;
  detail: string | null;
  createdAt: string;
}

/**
 * A notification, fed from the backend's independent "notifier" Kafka consumer
 * group (UC2 fan-out — same events as the activity log, separate consumer).
 */
export interface Notification {
  id: number;
  todoId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
