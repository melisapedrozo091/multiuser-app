import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalClients: number;
  totalAdmins: number;
  totalCourses: number;
  totalForumQueries: number;
  coursesInProgress: number;
  coursesCompleted: number;
  coursesCanceled: number;
  clientSatisfactionRate: number;
  totalRevenueUsd: number;
  topDemandedCourses: {
    id: number;
    name: string;
    price: number;
    rating: string;
    enrolledCount: number;
    satisfaction: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private auth: AuthService) {}

  private getHeaders(): HeadersInit {
    const token = this.auth.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${environment.apiBase}/admin/metrics`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al obtener métricas del sistema');
    }
    return res.json();
  }

  async importCourses(courses: { name: string; description?: string; price: number; stock?: number }[]): Promise<{ message: string; importedCount: number }> {
    const res = await fetch(`${environment.apiBase}/admin/courses/import`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ courses })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al importar nuevos cursos');
    }
    return res.json();
  }
}
