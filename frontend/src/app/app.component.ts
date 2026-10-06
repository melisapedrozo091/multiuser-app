import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

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
  }

  closeArrepentimiento(): void {
    this.showArrepentimientoModal = false;
    this.arrepentimientoData = { email: '', dni: '', code: '', reason: '' };
  }

  sendArrepentimiento(): void {
    if (!this.arrepentimientoData.email || !this.arrepentimientoData.dni) {
      alert('Por favor completa tu email y DNI para procesar la solicitud.');
      return;
    }
    this.arrepentimientoSent = true;
    setTimeout(() => {
      this.closeArrepentimiento();
      alert('✅ Solicitud de arrepentimiento enviada con éxito. Recibirás el número de trámite en tu correo.');
    }, 1500);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
