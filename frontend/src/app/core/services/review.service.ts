import { Injectable } from '@angular/core';
import { CourseReview } from '../models/app-models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly STORAGE_KEY = 'academia_course_reviews';

  constructor(private auth: AuthService) {}

  private getHeaders(): HeadersInit {
    const token = this.auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getReviews(): Promise<CourseReview[]> {
    try {
      const res = await fetch(`${environment.apiBase}/reviews`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Error al cargar reseñas');
      const data: CourseReview[] = await res.json();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('Backend offline o error al consultar reseñas, usando almacenamiento local:', err);
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
      return [
        {
          id: 'seed-1',
          courseId: 1,
          courseName: 'Curso Completo de Desarrollo Web Fullstack',
          userEmail: 'carlos.mendoza@gmail.com',
          userName: 'Carlos Mendoza',
          rating: 5,
          comment: '¡Excelente curso! Los proyectos prácticos con Angular y Node.js me permitieron conseguir mi primer puesto como programador frontend.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'seed-2',
          courseId: 2,
          courseName: 'Python para Ciencia de Datos e Inteligencia Artificial',
          userEmail: 'lucia.gomez@gmail.com',
          userName: 'Lucía Gómez',
          rating: 5,
          comment: 'Los módulos de Pandas y Scikit-Learn están muy bien explicados paso a paso. Resolvieron todas mis dudas en el foro con rapidez.',
          createdAt: new Date().toISOString()
        }
      ];
    }
  }

  async createReview(payload: {
    courseId: number;
    courseName: string;
    rating: number;
    comment: string;
  }): Promise<CourseReview> {
    const user = this.auth.currentUser;
    try {
      const res = await fetch(`${environment.apiBase}/reviews`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar la reseña en la base de datos');
      }
      const result = await res.json();
      const saved: CourseReview = result.review || result;
      this.updateLocalCache(saved);
      return saved;
    } catch (err: any) {
      // Local fallback
      const localReview: CourseReview = {
        id: 'rev_' + Date.now(),
        courseId: payload.courseId,
        courseName: payload.courseName,
        userId: user?.id || 'usr_local',
        userEmail: user?.email || 'alumno@gmail.com',
        userName: user?.displayName || user?.email || 'Estudiante',
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString()
      };
      this.updateLocalCache(localReview);
      return localReview;
    }
  }

  private updateLocalCache(review: CourseReview): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let list: CourseReview[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(r => r.courseId === review.courseId && r.userEmail === review.userEmail);
      if (idx !== -1) {
        list[idx] = review;
      } else {
        list.unshift(review);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando reseña en caché local', e);
    }
  }
}
