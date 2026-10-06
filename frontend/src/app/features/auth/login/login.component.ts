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
      role: ['CLIENTE', [Validators.required]]
    });
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.isResetMode = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.updateValidators();
  }

  toggleResetMode(): void {
    this.isResetMode = !this.isResetMode;
    this.isRegister = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.updateValidators();
  }

  private updateValidators(): void {
    const passwordControl = this.loginForm.get('password');
    if (this.isResetMode) {
      passwordControl?.clearValidators();
    } else {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    passwordControl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const { email, password, displayName, role } = this.loginForm.value;

    try {
      if (this.isResetMode) {
        if (!email) {
          this.errorMessage = 'Ingresa tu correo electrónico para restaurar la contraseña';
          this.loading = false;
          return;
        }
        const res = await this.auth.resetPassword(email);
        this.successMessage = res.message || 'Se ha enviado un correo con las instrucciones de restauración.';
      } else if (this.isRegister) {
        await this.auth.register(email, password, displayName, role);
        this.router.navigate(['/products']);
      } else {
        await this.auth.login(email, password);
        this.router.navigate(['/products']);
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Error al procesar solicitud';
    } finally {
      this.loading = false;
    }
  }
}
