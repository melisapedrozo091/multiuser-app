import { Injectable, inject } from '@angular/core';
import { Product, User } from '../models/app-models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Enrollment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: number;
  courseName: string;
  price: number;
  currency: string;
  date: string;
  createdAt: string; // ISO String
  pausedAt?: string | null; // ISO String when course was paused
  status: 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADO' | 'PAUSADO' | 'ANULADO' | 'ELIMINADO';
  paymentMethod: string;
  rating?: number; // 1 to 5
  reviewComment?: string;
  refundReason?: string;
  deletedFromUi?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly STORAGE_KEY = 'all_app_enrollments';
  private auth = inject(AuthService);

  constructor() {
    this.initDefaultEnrollments();
  }

  private initDefaultEnrollments(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

      const defaults: Enrollment[] = [
        {
          id: 'INS-2026-001',
          userId: 'usr_client',
          userEmail: 'cliente@gmail.com',
          userName: 'Carlos López',
          courseId: 1,
          courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
          price: 199.99,
          currency: 'USD',
          date: '10/10/2026',
          createdAt: twentyDaysAgo,
          status: 'EN_CURSO',
          paymentMethod: 'Tarjeta de Crédito (Visa)',
          rating: 5,
          reviewComment: 'Excelente curso, muy completo y práctico.'
        },
        {
          id: 'INS-2026-002',
          userId: 'usr_client',
          userEmail: 'cliente@gmail.com',
          userName: 'Carlos López',
          courseId: 2,
          courseName: 'Masterclass en TypeScript & Arquitectura Limpia',
          price: 149.50,
          currency: 'USD',
          date: '01/10/2026',
          createdAt: tenDaysAgo,
          status: 'FINALIZADO',
          paymentMethod: 'MercadoPago',
          rating: 5,
          reviewComment: 'La mejor masterclass de patrones de diseño.'
        },
        {
          id: 'INS-2026-003',
          userId: 'usr_melisa',
          userEmail: 'melisapedrozo091@gmail.com',
          userName: 'Melisa Pedrozo',
          courseId: 3,
          courseName: 'Curso Avanzado de Bases de Datos & Prisma ORM',
          price: 89.99,
          currency: 'USD',
          date: '18/10/2026',
          createdAt: twoDaysAgo,
          status: 'INSCRIPTO',
          paymentMethod: 'Transferencia Bancaria'
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaults));
    }
  }

  getAllEnrollments(includeDeleted = false): Enrollment[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const list: Enrollment[] = raw ? JSON.parse(raw) : [];
    if (includeDeleted) return list;
    return list.filter(e => !e.deletedFromUi && e.status !== 'ELIMINADO');
  }

  getUserEnrollments(userEmail: string): Enrollment[] {
    return this.getAllEnrollments(true).filter(
      e => e.userEmail.toLowerCase() === userEmail.toLowerCase() && !e.deletedFromUi && e.status !== 'ELIMINADO'
    );
  }

  // REGLA: Cada usuario se puede inscribir una sola vez por curso
  isUserEnrolled(userEmail: string, courseId: number): boolean {
    if (!userEmail) return false;
    const userList = this.getUserEnrollments(userEmail);
    return userList.some(
      e => e.courseId === courseId && e.status !== 'ANULADO' && e.status !== 'ELIMINADO'
    );
  }

  // REGLA: Plazo de 3 meses (90 días) para reanudar un curso frenado
  canResume(enrollment: Enrollment): { allowed: boolean; remainingDays: number; message: string } {
    if (!enrollment.pausedAt) {
      return { allowed: true, remainingDays: 90, message: 'El curso puede ser reanudado normalmente.' };
    }
    const pausedDate = new Date(enrollment.pausedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - pausedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      return {
        allowed: false,
        remainingDays: 0,
        message: `Han transcurrido ${diffDays} días (más de 3 meses) desde que el curso fue pausado. El plazo límite de 90 días para reanudar ha expirado.`
      };
    }

    return {
      allowed: true,
      remainingDays: 90 - diffDays,
      message: `Tienes ${90 - diffDays} días restantes para reanudar el curso dentro del plazo de 3 meses.`
    };
  }

  // REGLA: Plazo de 3 meses (90 días) para cancelar y solicitar reembolso (Botón de Arrepentimiento)
  canCancelAndRefund(enrollment: Enrollment): { allowed: boolean; remainingDays: number; message: string } {
    const enrollDate = enrollment.createdAt ? new Date(enrollment.createdAt) : new Date(enrollment.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - enrollDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      return {
        allowed: false,
        remainingDays: 0,
        message: `Han transcurrido ${diffDays} días desde la solicitud. El plazo de 3 meses (90 días) para cancelar y solicitar reembolso ha expirado.`
      };
    }

    return {
      allowed: true,
      remainingDays: 90 - diffDays,
      message: `Tienes ${90 - diffDays} días restantes para ejercer el derecho de arrepentimiento y reembolso total.`
    };
  }

  registerEnrollment(course: Product, user: User, paymentMethod: string, currency = 'USD'): Enrollment {
    // Validar inscripción única
    if (this.isUserEnrolled(user.email, course.id)) {
      throw new Error(`Ya te encuentras inscripto en "${course.name}". No es posible inscribirse más de una vez al mismo curso.`);
    }

    const enrollments = this.getAllEnrollments(true);
    const newId = `INS-2026-00${enrollments.length + 1}`;
    const today = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const nowIso = new Date().toISOString();

    const newEnrollment: Enrollment = {
      id: newId,
      userId: user.id || 'usr_client',
      userEmail: user.email,
      userName: user.displayName || user.email,
      courseId: course.id,
      courseName: course.name,
      price: course.price,
      currency,
      date: today,
      createdAt: nowIso,
      status: 'INSCRIPTO',
      paymentMethod,
      deletedFromUi: false
    };

    enrollments.unshift(newEnrollment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    // Sincronizar en segundo plano con la base de datos MySQL si hay backend activo
    this.syncWithBackend(newEnrollment);

    return newEnrollment;
  }

  // ACCIÓN: Pausar / Suspender
  pauseEnrollment(enrollmentId: string): { success: boolean; message: string } {
    const enrollments = this.getAllEnrollments(true);
    const item = enrollments.find(e => e.id === enrollmentId);
    if (!item) return { success: false, message: 'Inscripción no encontrada' };

    item.status = 'PAUSADO';
    item.pausedAt = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    this.syncUpdateToBackend(enrollmentId, { action: 'PAUSE' });
    return { success: true, message: `Curso "${item.courseName}" pausado con éxito.` };
  }

  // ACCIÓN: Reanudar (Validando 3 meses)
  resumeEnrollment(enrollmentId: string): { success: boolean; message: string } {
    const enrollments = this.getAllEnrollments(true);
    const item = enrollments.find(e => e.id === enrollmentId);
    if (!item) return { success: false, message: 'Inscripción no encontrada' };

    const check = this.canResume(item);
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    item.status = 'EN_CURSO';
    item.pausedAt = null;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    this.syncUpdateToBackend(enrollmentId, { action: 'RESUME' });
    return { success: true, message: `Curso "${item.courseName}" reanudado con éxito. ¡A seguir aprendiendo!` };
  }

  // ACCIÓN: Cancelar & Reembolso (Botón de Arrepentimiento - Validando 3 meses)
  cancelAndRefund(enrollmentId: string, reason: string): { success: boolean; message: string } {
    const enrollments = this.getAllEnrollments(true);
    const item = enrollments.find(e => e.id === enrollmentId);
    if (!item) return { success: false, message: 'Inscripción no encontrada' };

    const check = this.canCancelAndRefund(item);
    if (!check.allowed && this.auth.currentUser?.role !== 'ADMIN') {
      return { success: false, message: check.message };
    }

    item.status = 'ANULADO';
    item.refundReason = reason || 'Cancelación solicitada por derecho de arrepentimiento';
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    this.syncUpdateToBackend(enrollmentId, { action: 'CANCEL', reason: item.refundReason });
    return { success: true, message: `Inscripción al curso "${item.courseName}" cancelada. Tu solicitud de reembolso ha sido procesada.` };
  }

  // ACCIÓN ADMIN: Eliminar (Soft delete de interfaz, preservado en BD)
  softDeleteEnrollment(enrollmentId: string): { success: boolean; message: string } {
    const enrollments = this.getAllEnrollments(true);
    const item = enrollments.find(e => e.id === enrollmentId);
    if (!item) return { success: false, message: 'Inscripción no encontrada' };

    item.deletedFromUi = true;
    item.status = 'ELIMINADO';
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    this.syncUpdateToBackend(enrollmentId, { action: 'DELETE' });
    return { success: true, message: `Suscripción eliminada de la vista visible (conservada en la base de datos).` };
  }

  // ACCIÓN: Calificar Curso
  rateCourse(enrollmentId: string, rating: number, comment?: string): { success: boolean; message: string } {
    const enrollments = this.getAllEnrollments(true);
    const item = enrollments.find(e => e.id === enrollmentId);
    if (!item) return { success: false, message: 'Inscripción no encontrada' };

    item.rating = rating;
    if (comment) item.reviewComment = comment;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    this.syncUpdateToBackend(enrollmentId, { action: 'RATE', rating, reviewComment: comment });
    return { success: true, message: `¡Gracias por calificar con ${rating} estrellas!` };
  }

  private async syncWithBackend(enrollment: Enrollment): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return;
    try {
      await fetch(`${environment.apiBase}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(enrollment)
      });
    } catch (e) {
      // Local fallback already saved
    }
  }

  private async syncUpdateToBackend(id: string, payload: any): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return;
    try {
      await fetch(`${environment.apiBase}/enrollments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Local fallback already saved
    }
  }
}

