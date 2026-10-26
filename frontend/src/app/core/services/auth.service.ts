import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/app-models';
import { environment } from '../../../environments/environment';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, Auth } from 'firebase/auth';

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

  private getFirebaseAuth(): Auth | null {
    try {
      if (
        !environment.firebase ||
        !environment.firebase.apiKey ||
        environment.firebase.apiKey.startsWith('YOUR_')
      ) {
        return null;
      }
      const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);
      return getAuth(app);
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      try {
        const cred = await signInWithEmailAndPassword(fbAuth, email, password);
        const token = await cred.user.getIdToken();
        localStorage.setItem('jwt_token', token);
        const role = email.toLowerCase().includes('admin') ? 'ADMIN' : 'CLIENTE';
        const user: User = {
          id: cred.user.uid,
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          role
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      } catch (fbErr: any) {
        console.warn('Firebase Auth directo no disponible o fallo de credenciales, intentando API backend:', fbErr?.message);
      }
    }

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
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      try {
        const cred = await createUserWithEmailAndPassword(fbAuth, email, password);
        const token = await cred.user.getIdToken();
        localStorage.setItem('jwt_token', token);
        const user: User = {
          id: cred.user.uid,
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: displayName || email.split('@')[0],
          role
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUserSubject.next(user);

        fetch(`${environment.apiBase}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName, role })
        }).catch(() => {});

        return user;
      } catch (fbErr: any) {
        console.warn('Firebase Auth register no disponible, intentando API backend:', fbErr?.message);
      }
    }

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
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      fbSignOut(fbAuth).catch(() => {});
    }
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
