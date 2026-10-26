import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../core/models/app-models';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  // New user modal state
  showCreateModal = false;
  createForm: FormGroup;
  creating = false;
  createError: string | null = null;
  createSuccess: string | null = null;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CLIENTE', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
  }

  async fetchUsers(): Promise<void> {
    this.loading = true;
    try {
      const token = this.auth.getToken();
      const res = await fetch(`${environment.apiBase}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
      this.users = await res.json();
    } catch (err: any) {
      this.error = err.message;
      // Fallback sample users for demo
      this.users = [
        { id: 'usr_1', email: 'admin@sistema.com', displayName: 'Administrador General', role: 'ADMIN' },
        { id: 'usr_2', email: 'cliente1@gmail.com', displayName: 'Carlos López', role: 'CLIENTE' },
        { id: 'usr_3', email: 'cliente2@outlook.com', displayName: 'María Gómez', role: 'CLIENTE' }
      ];
    } finally {
      this.loading = false;
    }
  }

  async toggleUserRole(user: User): Promise<void> {
    const newRole = user.role === 'ADMIN' ? 'CLIENTE' : 'ADMIN';
    try {
      const token = this.auth.getToken();
      const res = await fetch(`${environment.apiBase}/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) throw new Error('No se pudo cambiar el rol');
      user.role = newRole;
    } catch (err) {
      // Local fallback for demo
      user.role = newRole;
    }
  }

  deleteUserFromView(user: User): void {
    if (confirm(`¿Deseas remover al usuario ${user.email} de la vista visible? (En la base de datos se conservará íntegro).`)) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }

  openCreateModal(): void {
    this.createForm.reset({
      displayName: '',
      email: '',
      password: '',
      role: 'CLIENTE'
    });
    this.createError = null;
    this.createSuccess = null;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createError = null;
    this.createSuccess = null;
  }

  async submitCreateUser(): Promise<void> {
    if (this.createForm.invalid) {
      this.createError = 'Por favor completa todos los campos correctamente (contraseña mínimo 6 caracteres).';
      return;
    }

    this.creating = true;
    this.createError = null;
    this.createSuccess = null;

    try {
      const token = this.auth.getToken();
      const res = await fetch(`${environment.apiBase}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.createForm.value)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario en el sistema');
      }

      this.createSuccess = `¡Usuario ${data.displayName || data.email} registrado exitosamente como ${data.role}!`;
      await this.fetchUsers();
      setTimeout(() => {
        this.closeCreateModal();
      }, 1500);
    } catch (err: any) {
      this.createError = err.message || 'Error de conexión al registrar usuario';
    } finally {
      this.creating = false;
    }
  }
}
