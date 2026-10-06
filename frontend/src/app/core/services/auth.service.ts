import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/app-models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  user$: Observable<User | null> = this.currentUserSubject.asObservable();

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${environment.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Fallo en autenticación');
    }

    const data = await res.json();
    localStorage.setItem('jwt_token', data.token);
    const user: User = data.user;
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  async register(email: string, password: string, displayName: string, role: 'ADMIN' | 'CLIENTE'): Promise<User> {
    const res = await fetch(`${environment.apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, role })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Fallo en registro');
    }

    const data = await res.json();
    localStorage.setItem('jwt_token', data.token);
    const user: User = data.user;
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
  }

  // STEP 1: Request 6-digit verification code
  async requestResetCode(email: string): Promise<{ message: string }> {
    const res = await fetch(`${environment.apiBase}/auth/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al solicitar código de verificación');
    }

    return res.json();
  }

  // STEP 2: Validate code and set new password
  async confirmResetPassword(email: string, resetCode: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${environment.apiBase}/auth/confirm-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetCode, newPassword })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al confirmar la nueva contraseña');
    }

    return res.json();
  }

  // Profile Change Password (authenticated)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const token = this.getToken();
    const res = await fetch(`${environment.apiBase}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al cambiar contraseña');
    }

    return res.json();
  }
}
