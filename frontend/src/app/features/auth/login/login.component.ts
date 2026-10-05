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
  errorMessage: string | null = null;
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
    this.errorMessage = null;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
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
