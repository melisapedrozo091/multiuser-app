import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/app-models';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  constructor(private auth: AuthService) {}

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
}
