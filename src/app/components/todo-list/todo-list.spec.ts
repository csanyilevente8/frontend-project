import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError, NEVER } from 'rxjs';
import { TodoList } from './todo-list';
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

describe('TodoList', () => {
  let fixture: ComponentFixture<TodoList>;
  let component: TodoList;
  let service: {
    getAll: ReturnType<typeof vi.fn>;
    setCompleted: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getAll: vi.fn(),
      setCompleted: vi.fn(),
      delete: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TodoList],
      providers: [provideRouter([]), { provide: TodoService, useValue: service }],
    }).compileComponents();
  });

  function create(): void {
    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
  }

  it('shows loading text while the request is in flight', () => {
    // NEVER emits, so the component stays in the loading state.
    service.getAll.mockReturnValue(NEVER);
    create();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(component.loading()).toBe(true);
    expect(text).toContain('Loading...');
  });

  it('renders the empty state when there are no todos', () => {
    service.getAll.mockReturnValue(of([]));
    create();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No todos yet');
  });

  it('renders todos when loaded', () => {
    service.getAll.mockReturnValue(of([makeTodo({ title: 'Buy milk' })]));
    create();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Buy milk');
  });

  it('shows an error message when loading fails', () => {
    service.getAll.mockReturnValue(throwError(() => new Error('boom')));
    create();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Unable to load todos');
    expect(component.loading()).toBe(false);
  });

  it('toggles completion via the service and updates the list', () => {
    const todo = makeTodo({ completed: false });
    service.getAll.mockReturnValue(of([todo]));
    service.setCompleted.mockReturnValue(of({ ...todo, completed: true }));
    create();
    fixture.detectChanges();

    component.toggleCompleted(todo);

    expect(service.setCompleted).toHaveBeenCalledWith(todo.id, true);
    expect(component.todos()[0].completed).toBe(true);
  });

  it('deletes after confirmation and removes the todo', () => {
    const todo = makeTodo();
    service.getAll.mockReturnValue(of([todo]));
    service.delete.mockReturnValue(of(void 0));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    create();
    fixture.detectChanges();

    component.deleteTodo(todo);

    expect(service.delete).toHaveBeenCalledWith(todo.id);
    expect(component.todos().length).toBe(0);
  });

  it('does not delete when confirmation is cancelled', () => {
    const todo = makeTodo();
    service.getAll.mockReturnValue(of([todo]));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    create();
    fixture.detectChanges();

    component.deleteTodo(todo);

    expect(service.delete).not.toHaveBeenCalled();
    expect(component.todos().length).toBe(1);
  });

  it('shows an error message when deletion fails', () => {
    const todo = makeTodo();
    service.getAll.mockReturnValue(of([todo]));
    service.delete.mockReturnValue(throwError(() => new Error('boom')));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    create();
    fixture.detectChanges();

    component.deleteTodo(todo);

    expect(component.errorMessage()).toContain('Unable to delete');
  });
});
