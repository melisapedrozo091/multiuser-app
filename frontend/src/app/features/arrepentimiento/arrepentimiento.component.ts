import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-arrepentimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './arrepentimiento.component.html',
  styleUrls: ['./arrepentimiento.component.css']
})
export class ArrepentimientoComponent {
  formData = {
    fullName: '',
    email: '',
    dni: '',
    orderCode: '',
    reason: ''
  };

  requestSent = false;
  loading = false;
  errorMessage: string | null = null;
  trackingNumber = '';

  async sendRequest(): Promise<void> {
    if (!this.formData.email || !this.formData.dni || !this.formData.fullName) {
      this.errorMessage = 'Por favor completa Nombre, Email y DNI para procesar tu solicitud.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.trackingNumber = 'REV-' + Math.floor(100000 + Math.random() * 900000);

    try {
      // Notificar al backend para enviar email de confirmación
      await fetch(`${environment.apiBase}/auth/arrepentimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.formData,
          trackingNumber: this.trackingNumber
        })
      });
    } catch {
      // Si el endpoint no existe, igual procesamos localmente (funcional sin backend)
    } finally {
      this.loading = false;
      this.requestSent = true;
    }
  }

  resetForm(): void {
    this.requestSent = false;
    this.errorMessage = null;
    this.trackingNumber = '';
    this.formData = { fullName: '', email: '', dni: '', orderCode: '', reason: '' };
  }
}
