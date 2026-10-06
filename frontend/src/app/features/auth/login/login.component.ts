import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isRegister = false;
  isResetMode = false;
  resetStep: 1 | 2 = 1; // Step 1: Request Code | Step 2: Validate Code & Set New Password

  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: [''],
      role: ['CLIENTE', [Validators.required]],
      resetCode: [''],
      newPassword: ['']
    });
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.isResetMode = false;
    this.resetStep = 1;
    this.errorMessage = null;
    this.successMessage = null;
  }

  toggleResetMode(): void {
    this.isResetMode = !this.isResetMode;
    this.isRegister = false;
    this.resetStep = 1;
    this.errorMessage = null;
    this.successMessage = null;
  }

  async onRequestCode(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Ingresa tu correo electrónico para recibir el código de verificación.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const res = await this.auth.requestResetCode(email);
      this.successMessage = res.message;
      this.resetStep = 2; // Move to Step 2
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al enviar código de verificación';
    } finally {
      this.loading = false;
    }
  }

  async onConfirmReset(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    const resetCode = this.loginForm.get('resetCode')?.value;
    const newPassword = this.loginForm.get('newPassword')?.value;

    if (!resetCode || resetCode.trim().length !== 6) {
      this.errorMessage = 'Ingresa el código de 6 dígitos enviado a tu correo.';
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const res = await this.auth.confirmResetPassword(email, resetCode.trim(), newPassword);
      this.successMessage = res.message;
      setTimeout(() => {
        this.isResetMode = false;
        this.resetStep = 1;
      }, 2500);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al validar el código y restablecer la contraseña';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isResetMode) {
      if (this.resetStep === 1) {
        await this.onRequestCode();
      } else {
        await this.onConfirmReset();
      }
      return;
    }

    if (this.loginForm.get('email')?.invalid || this.loginForm.get('password')?.invalid) {
      this.errorMessage = 'Por favor completa correctamente el correo y la contraseña.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const { email, password, displayName, role } = this.loginForm.value;

    try {
      if (this.isRegister) {
        await this.auth.register(email, password, displayName, role);
      } else {
        await this.auth.login(email, password);
      }
      this.router.navigate(['/products']);
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al autenticar';
    } finally {
      this.loading = false;
    }
  }
}
