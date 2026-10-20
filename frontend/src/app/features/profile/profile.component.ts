import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { EnrollmentService, Enrollment } from '../../core/services/enrollment.service';

export interface UserCourse {
  id: number;
  name: string;
  category: string;
  icon: string;
  status: 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADO';
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
export class ProfileComponent implements OnInit {
  activeTab: 'cursos' | 'certificados' | 'pagos' | 'seguridad' = 'cursos';
  courseFilter: 'TODOS' | 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADOS' = 'TODOS';

  // Password change form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Mock User Courses Data (Informativo de Cursos al Día)
  userCourses: UserCourse[] = [
    {
      id: 1,
      name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      category: 'Fullstack',
      icon: '💻',
      status: 'EN_CURSO',
      progress: 65,
      lastAccess: 'Módulo 3: Servicios REST y Autenticación'
    },
    {
      id: 2,
      name: 'Masterclass en TypeScript & Arquitectura Limpia',
      category: 'TypeScript',
      icon: '⚡',
      status: 'FINALIZADO',
      progress: 100,
      lastAccess: 'Curso finalizado con éxito',
      certificateId: 'CERT-TS-2026-9812'
    },
    {
      id: 3,
      name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      category: 'Bases de Datos',
      icon: '🗄️',
      status: 'INSCRIPTO',
      progress: 0,
      lastAccess: 'Inscripción confirmada - Clases habilitadas'
    },
    {
      id: 4,
      name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      category: 'DevOps',
      icon: '🐳',
      status: 'EN_CURSO',
      progress: 30,
      lastAccess: 'Módulo 1: Fundamentos de Contenedores Docker'
    }
  ];

  // Payment Methods
  paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'VISA', last4: '4821', holder: 'Carlos López', isDefault: true },
    { id: '2', type: 'MERCADOPAGO', last4: 'MP-PAY', holder: 'carlos.lopez@gmail.com', isDefault: false },
    { id: '3', type: 'MASTERCARD', last4: '8812', holder: 'Carlos López', isDefault: false }
  ];

  // Payment Method Modal & Form State
  showPaymentModal = false;
  editingPaymentMethodId: string | null = null;
  pmType: 'VISA' | 'MASTERCARD' | 'MERCADOPAGO' = 'VISA';
  pmLast4 = '';
  pmHolder = '';
  pmIsDefault = false;
  paymentFormError: string | null = null;

  // Purchase Invoices History
  invoices = [
    { id: 'FAC-2026-001', date: '01/10/2026', concept: 'Inscripción Fullstack & TypeScript', amount: '$ 349.49 USD', status: 'Pagado' },
    { id: 'FAC-2026-002', date: '15/09/2026', concept: 'Curso Prisma ORM', amount: '$ 89.99 USD', status: 'Pagado' }
  ];

  private enrollmentService = inject(EnrollmentService);

  constructor(
    public auth: AuthService,
    private pdfExport: PdfExportService
  ) {}

  ngOnInit(): void {
    this.loadPaymentMethods();
    this.loadUserCourses();
  }

  loadUserCourses(): void {
    const user = this.auth.currentUser;
    if (!user || !user.email) return;

    const enrollments = this.enrollmentService.getUserEnrollments(user.email);
    if (enrollments && enrollments.length > 0) {
      this.userCourses = enrollments.map((e: Enrollment) => ({
        id: e.courseId,
        name: e.courseName,
        category: 'Formación Tech',
        icon: '💻',
        status: e.status === 'ANULADO' ? 'INSCRIPTO' : e.status,
        progress: e.status === 'FINALIZADO' ? 100 : (e.status === 'EN_CURSO' ? 50 : 0),
        lastAccess: e.status === 'FINALIZADO' 
          ? 'Curso finalizado con éxito' 
          : (e.status === 'EN_CURSO' ? 'Módulo 2 en desarrollo' : 'Inscripción confirmada - Clases habilitadas'),
        certificateId: e.status === 'FINALIZADO' ? `CERT-${e.courseId}-2026` : undefined
      }));
    } else {
      // Si el usuario es nuevo y no tiene inscripciones
      this.userCourses = [];
    }
  }

  loadPaymentMethods(): void {
    const user = this.auth.currentUser;
    const userEmail = user?.email || 'default';
    const stored = localStorage.getItem(`payment_methods_${userEmail}`);
    if (stored) {
      try {
        this.paymentMethods = JSON.parse(stored);
        return;
      } catch (e) {
        console.error('Error cargando medios de pago guardados:', e);
      }
    }

    // EL ADMIN NUNCA DEBE TENER TARJETAS CARGADAS POR DEFECTO
    // Se deja vacío [] para que él mismo ingrese sus datos luego
    if (user?.role === 'ADMIN') {
      this.paymentMethods = [];
      return;
    }

    // Para clientes sin tarjetas previas
    this.paymentMethods = [];
  }

  savePaymentMethodsToStorage(): void {
    const userEmail = this.auth.currentUser?.email || 'default';
    localStorage.setItem(`payment_methods_${userEmail}`, JSON.stringify(this.paymentMethods));
  }

  setTab(tab: 'cursos' | 'certificados' | 'pagos' | 'seguridad'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  setCourseFilter(filter: 'TODOS' | 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADOS'): void {
    this.courseFilter = filter;
  }

  get filteredCourses(): UserCourse[] {
    if (this.courseFilter === 'INSCRIPTO') return this.userCourses.filter(c => c.status === 'INSCRIPTO');
    if (this.courseFilter === 'EN_CURSO') return this.userCourses.filter(c => c.status === 'EN_CURSO');
    if (this.courseFilter === 'FINALIZADOS') return this.userCourses.filter(c => c.status === 'FINALIZADO');
    return this.userCourses;
  }

  get completedCertificates(): UserCourse[] {
    return this.userCourses.filter(c => c.status === 'FINALIZADO');
  }

  // --- CRUD MEDIOS DE PAGO ---
  openAddPaymentModal(): void {
    this.editingPaymentMethodId = null;
    this.pmType = 'VISA';
    this.pmLast4 = '';
    this.pmHolder = this.auth.currentUser?.displayName || '';
    this.pmIsDefault = this.paymentMethods.length === 0;
    this.paymentFormError = null;
    this.showPaymentModal = true;
  }

  openEditPaymentModal(pm: PaymentMethod): void {
    this.editingPaymentMethodId = pm.id;
    this.pmType = pm.type;
    this.pmLast4 = pm.last4;
    this.pmHolder = pm.holder;
    this.pmIsDefault = pm.isDefault;
    this.paymentFormError = null;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.editingPaymentMethodId = null;
    this.paymentFormError = null;
  }

  savePaymentMethod(): void {
    if (!this.pmHolder.trim()) {
      this.paymentFormError = 'Ingresa el nombre del titular.';
      return;
    }
    if (!this.pmLast4.trim()) {
      this.paymentFormError = 'Ingresa los últimos 4 dígitos o identificación del medio de pago.';
      return;
    }

    if (this.pmIsDefault) {
      this.paymentMethods.forEach(p => p.isDefault = false);
    }

    if (this.editingPaymentMethodId) {
      // Edit existing
      const index = this.paymentMethods.findIndex(p => p.id === this.editingPaymentMethodId);
      if (index !== -1) {
        this.paymentMethods[index] = {
          id: this.editingPaymentMethodId,
          type: this.pmType,
          last4: this.pmLast4.trim(),
          holder: this.pmHolder.trim(),
          isDefault: this.pmIsDefault
        };
      }
    } else {
      // Create new
      const newId = Date.now().toString();
      this.paymentMethods.push({
        id: newId,
        type: this.pmType,
        last4: this.pmLast4.trim(),
        holder: this.pmHolder.trim(),
        isDefault: this.pmIsDefault || this.paymentMethods.length === 0
      });
    }

    this.savePaymentMethodsToStorage();
    this.closePaymentModal();
  }

  deletePaymentMethod(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medio de pago?')) {
      this.paymentMethods = this.paymentMethods.filter(p => p.id !== id);
      if (this.paymentMethods.length > 0 && !this.paymentMethods.some(p => p.isDefault)) {
        this.paymentMethods[0].isDefault = true;
      }
      this.savePaymentMethodsToStorage();
    }
  }

  setDefaultPaymentMethod(id: string): void {
    this.paymentMethods.forEach(p => {
      p.isDefault = (p.id === id);
    });
    this.savePaymentMethodsToStorage();
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
    const studentName = this.auth.currentUser?.displayName || this.auth.currentUser?.email || 'Estudiante Registrado';
    const certId = course.certificateId || `CERT-${course.id}-2026`;
    this.pdfExport.generateCertificatePdf(studentName, course.name, certId);
  }

  downloadInvoicePdf(invoice: any): void {
    const clientName = this.auth.currentUser?.displayName || 'Cliente Registrado';
    const clientEmail = this.auth.currentUser?.email || 'cliente@ejemplo.com';
    this.pdfExport.generateInvoicePdf(clientName, clientEmail, invoice);
  }
}
