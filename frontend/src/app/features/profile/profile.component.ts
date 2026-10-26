import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { EnrollmentService, Enrollment } from '../../core/services/enrollment.service';
import { ReviewService } from '../../core/services/review.service';

export interface UserCourse {
  id: number;
  enrollmentId: string;
  name: string;
  category: string;
  icon: string;
  status: 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADO' | 'PAUSADO' | 'ANULADO';
  progress: number;
  lastAccess: string;
  certificateId?: string;
  pausedAt?: string | null;
  createdAt?: string;
  rating?: number;
  reviewComment?: string;
  canResume: boolean;
  resumeRemainingDays: number;
  resumeMessage: string;
  canRefund: boolean;
  refundRemainingDays: number;
  refundMessage: string;
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
  courseFilter: 'TODOS' | 'INSCRIPTO' | 'EN_CURSO' | 'PAUSADO' | 'FINALIZADOS' = 'TODOS';

  // Password change form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Mock User Courses Data (Informativo de Cursos al Día)
  userCourses: UserCourse[] = [];

  // Modals de Reembolso & Calificación
  showRefundModal = false;
  refundModalCourse: UserCourse | null = null;
  refundReason = 'Incompatibilidad de horarios o contenido';

  showRatingModal = false;
  ratingModalCourse: UserCourse | null = null;
  selectedRating = 5;
  ratingComment = '';

  // Payment Methods
  paymentMethods: PaymentMethod[] = [];

  // Payment Method Modal & Form State
  showPaymentModal = false;
  editingPaymentMethodId: string | null = null;
  pmType: 'VISA' | 'MASTERCARD' | 'MERCADOPAGO' = 'VISA';
  pmLast4 = '';
  pmHolder = '';
  pmIsDefault = false;
  paymentFormError: string | null = null;

  // Purchase Invoices History
  invoices: { id: string; date: string; concept: string; amount: string; status: string }[] = [];

  private enrollmentService = inject(EnrollmentService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);

  constructor(
    public auth: AuthService,
    private pdfExport: PdfExportService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['cursos', 'certificados', 'pagos', 'seguridad'].includes(params['tab'])) {
        this.activeTab = params['tab'];
      }
    });

    this.loadPaymentMethods();
    this.loadUserCourses();
    this.loadInvoices();
  }

  loadInvoices(): void {
    const user = this.auth.currentUser;
    if (!user || !user.email) return;

    const userEnrollments = this.enrollmentService.getUserEnrollments(user.email);
    if (userEnrollments && userEnrollments.length > 0) {
      this.invoices = userEnrollments.map((e: Enrollment) => ({
        id: 'FAC-' + e.id.replace('INS-', ''),
        date: e.date,
        concept: `Inscripción: ${e.courseName}`,
        amount: `$ ${e.price.toFixed(2)} ${e.currency || 'USD'}`,
        status: e.status === 'ANULADO' ? 'Reembolsado' : 'Pagado'
      }));
    } else {
      this.invoices = [];
    }
  }

  loadUserCourses(): void {
    const user = this.auth.currentUser;
    if (!user || !user.email) return;

    const enrollments = this.enrollmentService.getUserEnrollments(user.email);
    if (enrollments && enrollments.length > 0) {
      this.userCourses = enrollments.map((e: Enrollment) => {
        const resumeInfo = this.enrollmentService.canResume(e);
        const refundInfo = this.enrollmentService.canCancelAndRefund(e);

        return {
          id: e.courseId,
          enrollmentId: e.id,
          name: e.courseName,
          category: 'Formación Tech',
          icon: '💻',
          status: (e.status === 'ELIMINADO' ? 'ANULADO' : e.status) as any,
          progress: e.status === 'FINALIZADO' ? 100 : (e.status === 'EN_CURSO' ? 50 : (e.status === 'PAUSADO' ? 25 : 0)),
          lastAccess: e.status === 'FINALIZADO' 
            ? 'Curso finalizado con éxito' 
            : (e.status === 'EN_CURSO' ? 'Módulo 2 en desarrollo' : (e.status === 'PAUSADO' ? 'Curso en pausa' : 'Inscripción confirmada - Clases habilitadas')),
          certificateId: e.status === 'FINALIZADO' ? `CERT-${e.courseId}-2026` : undefined,
          pausedAt: e.pausedAt,
          createdAt: e.createdAt,
          rating: e.rating,
          reviewComment: e.reviewComment,
          canResume: resumeInfo.allowed,
          resumeRemainingDays: resumeInfo.remainingDays,
          resumeMessage: resumeInfo.message,
          canRefund: refundInfo.allowed,
          refundRemainingDays: refundInfo.remainingDays,
          refundMessage: refundInfo.message
        };
      });
    } else {
      this.userCourses = [];
    }
  }

  // --- ACCIONES DE CURSOS PARA CLIENTE ---
  pauseCourse(course: UserCourse): void {
    const res = this.enrollmentService.pauseEnrollment(course.enrollmentId);
    if (res.success) {
      this.successMessage = res.message;
      this.errorMessage = null;
      this.loadUserCourses();
    } else {
      this.errorMessage = res.message;
      this.successMessage = null;
    }
  }

  resumeCourse(course: UserCourse): void {
    const res = this.enrollmentService.resumeEnrollment(course.enrollmentId);
    if (res.success) {
      this.successMessage = res.message;
      this.errorMessage = null;
      this.loadUserCourses();
    } else {
      this.errorMessage = res.message;
      this.successMessage = null;
    }
  }

  // Botón de Arrepentimiento / Cancelación
  openRefundModal(course: UserCourse): void {
    this.refundModalCourse = course;
    this.refundReason = 'Incompatibilidad de horarios o cambio de planes';
    this.showRefundModal = true;
    this.errorMessage = null;
    this.successMessage = null;
  }

  closeRefundModal(): void {
    this.showRefundModal = false;
    this.refundModalCourse = null;
  }

  confirmRefund(): void {
    if (!this.refundModalCourse) return;
    const res = this.enrollmentService.cancelAndRefund(this.refundModalCourse.enrollmentId, this.refundReason);
    if (res.success) {
      this.successMessage = res.message;
      this.errorMessage = null;
      this.closeRefundModal();
      this.loadUserCourses();
      this.loadInvoices();
    } else {
      this.errorMessage = res.message;
    }
  }

  // Calificar Curso
  openRatingModal(course: UserCourse): void {
    this.ratingModalCourse = course;
    this.selectedRating = course.rating || 5;
    this.ratingComment = course.reviewComment || '';
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.ratingModalCourse = null;
  }

  async confirmRating(): Promise<void> {
    if (!this.ratingModalCourse) return;
    const courseId = this.ratingModalCourse.id;
    const courseName = this.ratingModalCourse.name;
    const rating = this.selectedRating;
    const comment = this.ratingComment;

    const res = this.enrollmentService.rateCourse(this.ratingModalCourse.enrollmentId, rating, comment);
    if (res.success) {
      try {
        await this.reviewService.createReview({
          courseId,
          courseName,
          rating,
          comment
        });
      } catch (e) {
        console.error('Error al guardar reseña en la base de datos:', e);
      }

      this.successMessage = `${res.message} Tu reseña se guardó en la base de datos y ya está visible en el Foro.`;
      this.closeRatingModal();
      this.loadUserCourses();
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

  setCourseFilter(filter: 'TODOS' | 'INSCRIPTO' | 'EN_CURSO' | 'PAUSADO' | 'FINALIZADOS'): void {
    this.courseFilter = filter;
  }

  get filteredCourses(): UserCourse[] {
    if (this.courseFilter === 'INSCRIPTO') return this.userCourses.filter(c => c.status === 'INSCRIPTO');
    if (this.courseFilter === 'EN_CURSO') return this.userCourses.filter(c => c.status === 'EN_CURSO');
    if (this.courseFilter === 'PAUSADO') return this.userCourses.filter(c => c.status === 'PAUSADO');
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

  get isAdmin(): boolean {
    return this.auth.currentUser?.role === 'ADMIN';
  }

  deleteCourseFromView(course: UserCourse): void {
    if (confirm(`¿Deseas remover el curso "${course.name}" de la lista visible? (En la base de datos se conservará íntegro).`)) {
      const res = this.enrollmentService.softDeleteEnrollment(course.enrollmentId);
      this.successMessage = res.message;
      this.errorMessage = null;
      this.loadUserCourses();
    }
  }

  deletePaymentMethod(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este medio de pago?')) {
      this.paymentMethods = this.paymentMethods.filter(p => p.id !== id);
      if (this.paymentMethods.length > 0 && !this.paymentMethods.some(p => p.isDefault)) {
        this.paymentMethods[0].isDefault = true;
      }
      this.savePaymentMethodsToStorage();
      this.successMessage = 'Medio de pago eliminado exitosamente.';
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
