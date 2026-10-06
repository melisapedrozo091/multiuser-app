import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/new',
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [roleGuard(['ADMIN'])]
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [roleGuard(['ADMIN'])]
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat-room/chat-room.component').then(m => m.ChatRoomComponent)
  },
  {
    path: 'metrics',
    loadComponent: () => import('./features/metrics/metrics-dashboard/metrics-dashboard.component').then(m => m.MetricsDashboardComponent)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [roleGuard(['ADMIN'])]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: 'landing' }
];
