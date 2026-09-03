import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TodoForm } from './todo-form';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'A',
    description: 'desc',
    completed: false,
    createdAt: '2026-09-03T12:00:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
    ...overrides,
  };
}

interface ServiceMock {
  getById: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

function configure(paramId: string | null, service: ServiceMock, router: { navigate: ReturnType<typeof vi.fn> }) {
  TestBed.configureTestingModule({
    imports: [TodoForm],
    providers: [
      { provide: TodoService, useValue: service },
      { provide: Router, useValue: router },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => paramId } } },
      },
    ],
  });
}

describe('TodoForm', () => {
  let fixture: ComponentFixture<TodoForm>;
  let component: TodoForm;
  let service: ServiceMock;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { getById: vi.fn(), create: vi.fn(), update: vi.fn() };
    router = { navigate: vi.fn() };
  });

  describe('create mode', () => {
    beforeEach(() => {
      configure(null, service, router);
      fixture = TestBed.createComponent(TodoForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('starts in create mode', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('is invalid when the title is empty', () => {
      component.form.setValue({ title: '', description: '', completed: false });
      expect(component.form.invalid).toBe(true);
    });

    it('is invalid when the title exceeds 255 chars', () => {
      component.form.patchValue({ title: 'x'.repeat(256) });
      expect(component.form.get('title')?.hasError('maxlength')).toBe(true);
    });

    it('does not call create when the form is invalid', () => {
      component.form.setValue({ title: '', description: '', completed: false });
      component.save();
      expect(service.create).not.toHaveBeenCalled();
    });

    it('calls create and navigates on valid submit', () => {
      service.create.mockReturnValue(of(makeTodo()));
      component.form.setValue({ title: 'New', description: 'body', completed: false });
      component.save();
      expect(service.create).toHaveBeenCalledWith({ title: 'New', description: 'body' });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('shows an error message when create fails', () => {
      service.create.mockReturnValue(throwError(() => new Error('boom')));
      component.form.setValue({ title: 'New', description: '', completed: false });
      component.save();
      expect(component.errorMessage()).toContain('Unable to save');
    });
  });

  describe('edit mode', () => {
    const existing = makeTodo({ title: 'Existing', completed: true });

    beforeEach(() => {
      service.getById.mockReturnValue(of(existing));
      configure(existing.id, service, router);
      fixture = TestBed.createComponent(TodoForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('loads the existing todo into the form', () => {
      expect(component.isEditMode).toBe(true);
      expect(component.form.get('title')?.value).toBe('Existing');
      expect(component.form.get('completed')?.value).toBe(true);
    });

    it('calls update and navigates on valid submit', () => {
      service.update.mockReturnValue(of(existing));
      component.form.patchValue({ title: 'Changed', completed: false });
      component.save();
      expect(service.update).toHaveBeenCalledWith(existing.id, {
        title: 'Changed',
        description: 'desc',
        completed: false,
      });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('shows an error message when loading fails', () => {
      // Reconfigure with a failing getById.
      TestBed.resetTestingModule();
      service.getById.mockReturnValue(throwError(() => new Error('boom')));
      configure(existing.id, service, router);
      const f = TestBed.createComponent(TodoForm);
      f.detectChanges();
      expect(f.componentInstance.errorMessage()).toContain('Unable to load');
    });
  });
});
