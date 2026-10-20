import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Academia Tech';
  showArrepentimientoModal = false;
  arrepentimientoData = { email: '', dni: '', code: '', reason: '' };
  arrepentimientoSent = false;
  arrepentimientoLoading = false;
  trackingNumber = '';

  constructor(
    public auth: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  openArrepentimiento(): void {
    this.showArrepentimientoModal = true;
    this.arrepentimientoSent = false;
    this.arrepentimientoLoading = false;
    this.arrepentimientoData = { email: '', dni: '', code: '', reason: '' };
    this.trackingNumber = '';
  }

  closeArrepentimiento(): void {
    this.showArrepentimientoModal = false;
  }

  async sendArrepentimiento(): Promise<void> {
    if (!this.arrepentimientoData.email || !this.arrepentimientoData.reason) {
      alert('Por favor completa al menos tu correo electrónico y el motivo de la revocación.');
      return;
    }

    this.arrepentimientoLoading = true;
    this.trackingNumber = 'REV-' + Math.floor(100000 + Math.random() * 900000);

    try {
      await fetch(`${environment.apiBase}/auth/arrepentimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: this.arrepentimientoData.email.split('@')[0],
          email: this.arrepentimientoData.email,
          dni: this.arrepentimientoData.dni || 'No especificado',
          orderCode: this.arrepentimientoData.code || 'Curso General',
          reason: this.arrepentimientoData.reason,
          trackingNumber: this.trackingNumber
        })
      });
    } catch {
      // Fallback si la API no estuviera disponible
    } finally {
      this.arrepentimientoLoading = false;
      this.arrepentimientoSent = true;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
