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

  constructor() {
    // Limpieza de sesiones previas en localStorage para asegurar que inicie siempre sin sesión iniciada
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
      localStorage.removeItem('jwt_token');
    }
  }

  private getStoredUser(): User | null {
    // Usamos sessionStorage: la sesión existe solo durante la pestaña activa del usuario
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('jwt_token');
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
    // 1. Siempre validar credenciales contra el backend (MySQL / phpMyAdmin)
    const res = await fetch(`${environment.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciales inválidas o usuario no registrado');
    }

    const data = await res.json();
    const user: User = data.user;
    sessionStorage.setItem('jwt_token', data.token);
    sessionStorage.setItem('user_data', JSON.stringify(user));

    // 2. Sincronizar sesión en Firebase Client en segundo plano
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      try {
        await signInWithEmailAndPassword(fbAuth, email, password);
      } catch (fbErr: any) {
        // Fallback no bloqueante si Firebase Client no tiene la contraseña
      }
    }

    this.currentUserSubject.next(user);
    return user;
  }

  async register(email: string, password: string, displayName: string, role: 'ADMIN' | 'CLIENTE'): Promise<User> {
    // 1. Siempre registrar y persistir primero en el backend (MySQL / phpMyAdmin)
    const res = await fetch(`${environment.apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, role })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fallo en registro en la base de datos');
    }

    const data = await res.json();

    // 2. Intentar autenticar/registrar también en Firebase Auth en segundo plano
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      try {
        await createUserWithEmailAndPassword(fbAuth, email, password);
      } catch (fbErr: any) {
        console.warn('Firebase Auth sync warning:', fbErr?.message);
      }
    }

    sessionStorage.setItem('jwt_token', data.token);
    const user: User = data.user;
    sessionStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  logout(): void {
    const fbAuth = this.getFirebaseAuth();
    if (fbAuth) {
      fbSignOut(fbAuth).catch(() => {});
    }
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_data');
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
