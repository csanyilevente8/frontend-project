import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TodoService } from './todo.service';
import { Todo } from '../models/todo.model';
import { environment } from '../../environments/environment';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/todos`;

  const sample: Todo = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'A',
    description: 'desc',
    completed: false,
    createdAt: '2026-09-03T12:00:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll issues GET and returns todos', () => {
    let result: Todo[] | undefined;
    service.getAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([sample]);

    expect(result).toEqual([sample]);
  });

  it('getById issues GET to the id url', () => {
    service.getById(sample.id).subscribe();
    const req = httpMock.expectOne(`${base}/${sample.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(sample);
  });

  it('create issues POST with the payload', () => {
    service.create({ title: 'New', description: 'x' }).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New', description: 'x' });
    req.flush(sample);
  });

  it('update issues PUT with the payload', () => {
    service
      .update(sample.id, { title: 'U', description: 'y', completed: true })
      .subscribe();
    const req = httpMock.expectOne(`${base}/${sample.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ title: 'U', description: 'y', completed: true });
    req.flush(sample);
  });

  it('setCompleted issues PATCH to the complete url', () => {
    service.setCompleted(sample.id, true).subscribe();
    const req = httpMock.expectOne(`${base}/${sample.id}/complete`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });
    req.flush({ ...sample, completed: true });
  });

  it('delete issues DELETE to the id url', () => {
    service.delete(sample.id).subscribe();
    const req = httpMock.expectOne(`${base}/${sample.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getActivity issues GET to the activity url', () => {
    service.getActivity().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/activity`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getNotifications issues GET to the notifications url', () => {
    service.getNotifications().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getUnreadNotificationCount issues GET to the unread-count url', () => {
    let result: { count: number } | undefined;
    service.getUnreadNotificationCount().subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 3 });
    expect(result).toEqual({ count: 3 });
  });

  it('markNotificationsRead issues POST to the read url', () => {
    service.markNotificationsRead().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/read`);
    expect(req.request.method).toBe('POST');
    req.flush({ updated: 3 });
  });
});
