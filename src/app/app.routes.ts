import { Routes } from '@angular/router';
import { TodoList } from './components/todo-list/todo-list';
import { TodoForm } from './components/todo-form/todo-form';

export const routes: Routes = [
  { path: '', component: TodoList },
  { path: 'todos/new', component: TodoForm },
  { path: 'todos/:id/edit', component: TodoForm },
  { path: '**', redirectTo: '' },
];
