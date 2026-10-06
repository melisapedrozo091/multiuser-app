import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface UserCourse {
  id: number;
  name: string;
  category: string;
  icon: string;
  status: 'EN_CURSO' | 'FINALIZADO' | 'ANULADO';
  progress: number;
  lastAccess: string;
  certificateId?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'VISA' | 'MASTERCARD' | 'MERCADOPAGO';
  last4: string;
  holder: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  activeTab: 'cursos' | 'certificados' | 'pagos' | 'seguridad' = 'cursos';
  courseFilter: 'TODOS' | 'EN_CURSO' | 'FINALIZADOS' | 'ANULADOS' = 'TODOS';

  // Password change form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Mock User Courses Data
  userCourses: UserCourse[] = [
    {
      id: 1,
      name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      category: 'Fullstack',
      icon: '💻',
      status: 'EN_CURSO',
      progress: 65,
      lastAccess: 'Hoy a las 14:30'
    },
    {
      id: 2,
      name: 'Masterclass en TypeScript & Arquitectura Limpia',
      category: 'TypeScript',
      icon: '⚡',
      status: 'FINALIZADO',
      progress: 100,
      lastAccess: 'Ayer',
      certificateId: 'CERT-TS-2026-9812'
    },
    {
      id: 3,
      name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      category: 'Bases de Datos',
      icon: '🗄️',
      status: 'EN_CURSO',
      progress: 30,
      lastAccess: 'Hace 2 días'
    },
    {
      id: 4,
      name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      category: 'DevOps',
      icon: '🐳',
      status: 'ANULADO',
      progress: 0,
      lastAccess: 'Revocado por Botón de Arrepentimiento'
    }
  ];

  // Payment Methods
  paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'VISA', last4: '4821', holder: 'Carlos López', isDefault: true },
    { id: '2', type: 'MERCADOPAGO', last4: 'MP-PAY', holder: 'carlos.lopez@gmail.com', isDefault: false },
    { id: '3', type: 'MASTERCARD', last4: '8812', holder: 'Carlos López', isDefault: false }
  ];

  // Purchase Invoices History
  invoices = [
    { id: 'FAC-2026-001', date: '01/10/2026', concept: 'Inscripción Fullstack & TypeScript', amount: '$ 349.49 USD', status: 'Pagado' },
    { id: 'FAC-2026-002', date: '15/09/2026', concept: 'Curso Prisma ORM', amount: '$ 89.99 USD', status: 'Pagado' }
  ];

  constructor(public auth: AuthService) {}

  setTab(tab: 'cursos' | 'certificados' | 'pagos' | 'seguridad'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  setCourseFilter(filter: 'TODOS' | 'EN_CURSO' | 'FINALIZADOS' | 'ANULADOS'): void {
    this.courseFilter = filter;
  }

  get filteredCourses(): UserCourse[] {
    if (this.courseFilter === 'EN_CURSO') return this.userCourses.filter(c => c.status === 'EN_CURSO');
    if (this.courseFilter === 'FINALIZADOS') return this.userCourses.filter(c => c.status === 'FINALIZADO');
    if (this.courseFilter === 'ANULADOS') return this.userCourses.filter(c => c.status === 'ANULADO');
    return this.userCourses;
  }

  get completedCertificates(): UserCourse[] {
    return this.userCourses.filter(c => c.status === 'FINALIZADO');
  }

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

  downloadCertificatePdf(course: UserCourse): void {
    const user = this.auth.currentUser;
    const content = `
====================================================
      ACADEMIA TECH - CERTIFICADO OFICIAL DE APROBACIÓN
====================================================
Certificamos que el estudiante:
${user?.displayName || user?.email || 'Alumno Registrado'}

ha completado satisfactoriamente el 100% de los módulos del curso:
"${course.name}"

Código de Validación QR: ${course.certificateId || 'CERT-2026-8812'}
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}
Estado: CERTIFICADO OFICIAL ACREDITADO

----------------------------------------------------
Verificación Online: https://academiatech.com/verify/${course.certificateId}
Academia Tech © 2026 - Firma del Director Académico
====================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_${course.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadInvoicePdf(invoice: any): void {
    const content = `
====================================================
          COMPROBANTE DE PAGO / FACTURA
====================================================
Factura N°: ${invoice.id}
Fecha: ${invoice.date}
Cliente: ${this.auth.currentUser?.displayName || this.auth.currentUser?.email}
Concepto: ${invoice.concept}
Monto Total: ${invoice.amount}
Estado: ${invoice.status}
----------------------------------------------------
Academia Tech S.A. - CUIT: 30-71234567-8
====================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${invoice.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
