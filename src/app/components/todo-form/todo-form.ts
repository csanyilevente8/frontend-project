import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

/**
 * Reusable form for both creating and editing a todo. When an :id route
 * parameter is present the form loads the existing todo and switches to
 * edit mode (including a completion toggle).
 *
 * View state uses signals so change detection runs correctly in this
 * zoneless application after asynchronous work completes.
 */
@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.css',
})
export class TodoForm {
  private readonly fb = inject(FormBuilder);
  private readonly todoService = inject(TodoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(2000)]],
    completed: [false],
  });

  readonly editId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loadTodo(id);
    }
  }

  get isEditMode(): boolean {
    return this.editId() !== null;
  }

  private loadTodo(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.todoService.getById(id).subscribe({
      next: (todo: Todo) => {
        this.form.patchValue({
          title: todo.title,
          description: todo.description ?? '',
          completed: todo.completed,
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load the todo. Please try again.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const editId = this.editId();

    if (editId) {
      this.todoService
        .update(editId, {
          title: value.title,
          description: value.description || null,
          completed: value.completed,
        })
        .subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.onSaveError(),
        });
    } else {
      this.todoService
        .create({
          title: value.title,
          description: value.description || null,
        })
        .subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.onSaveError(),
        });
    }
  }

  private onSaveError(): void {
    this.errorMessage.set('Unable to save the todo. Please try again.');
    this.saving.set(false);
  }

  hasError(control: string, error: string): boolean {
    const c = this.form.get(control);
    return !!c && c.touched && c.hasError(error);
  }
}
