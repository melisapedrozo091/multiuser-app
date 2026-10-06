import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  trackingNumber = '';

  sendRequest(): void {
    if (!this.formData.email || !this.formData.dni || !this.formData.fullName) {
      alert('Por favor completa Nombre, Email y DNI para procesar tu solicitud.');
      return;
    }

    this.trackingNumber = 'REV-' + Math.floor(100000 + Math.random() * 900000);
    this.requestSent = true;
  }

  resetForm(): void {
    this.requestSent = false;
    this.formData = { fullName: '', email: '', dni: '', orderCode: '', reason: '' };
  }
}
