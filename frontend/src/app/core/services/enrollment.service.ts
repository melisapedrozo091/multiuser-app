import { Injectable } from '@angular/core';
import { Product, User } from '../models/app-models';

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
  status: 'INSCRIPTO' | 'EN_CURSO' | 'FINALIZADO' | 'ANULADO';
  paymentMethod: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly STORAGE_KEY = 'all_app_enrollments';

  constructor() {
    this.initDefaultEnrollments();
  }

  private initDefaultEnrollments(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
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
          status: 'EN_CURSO',
          paymentMethod: 'Tarjeta de Crédito (Visa)'
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
          status: 'FINALIZADO',
          paymentMethod: 'MercadoPago'
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
          status: 'INSCRIPTO',
          paymentMethod: 'Transferencia Bancaria'
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaults));
    }
  }

  getAllEnrollments(): Enrollment[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  getUserEnrollments(userEmail: string): Enrollment[] {
    return this.getAllEnrollments().filter(
      e => e.userEmail.toLowerCase() === userEmail.toLowerCase()
    );
  }

  registerEnrollment(course: Product, user: User, paymentMethod: string, currency = 'USD'): Enrollment {
    const enrollments = this.getAllEnrollments();
    const newId = `INS-2026-00${enrollments.length + 1}`;
    const today = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

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
      status: 'INSCRIPTO',
      paymentMethod
    };

    // Agregar al listado global
    enrollments.unshift(newEnrollment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));

    return newEnrollment;
  }

  cancelEnrollment(enrollmentId: string): boolean {
    const enrollments = this.getAllEnrollments();
    const item = enrollments.find(e => e.id === enrollmentId);
    if (item) {
      item.status = 'ANULADO';
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrollments));
      return true;
    }
    return false;
  }
}
