import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(public auth: AuthService) {}

  async onChangePassword(): Promise<void> {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'La confirmación de la nueva contraseña no coincide.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const res = await this.auth.changePassword(this.currentPassword, this.newPassword);
      this.successMessage = res.message || 'Contraseña actualizada con éxito.';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al cambiar la contraseña';
    } finally {
      this.loading = false;
    }
  }
}
