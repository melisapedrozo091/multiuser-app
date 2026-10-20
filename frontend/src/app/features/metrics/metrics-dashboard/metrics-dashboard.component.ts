import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';
import { CsvExportService } from '../../../core/services/csv-export.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService, Enrollment } from '../../../core/services/enrollment.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.css']
})
export class MetricsDashboardComponent implements OnInit, OnDestroy {
  metrics: DashboardMetrics | null = null;
  enrollments: Enrollment[] = [];
  loading = true;
  error: string | null = null;

  public enrollmentService = inject(EnrollmentService);
  private chart1: Chart | null = null;
  private chart2: Chart | null = null;

  constructor(
    private adminService: AdminService,
    public csvExport: CsvExportService,
    private pdfExport: PdfExportService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
    this.enrollments = this.enrollmentService.getAllEnrollments();
    this.renderCharts();
  }

  ngOnDestroy(): void {
    if (this.chart1) this.chart1.destroy();
    if (this.chart2) this.chart2.destroy();
  }

  async loadMetrics(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.metrics = await this.adminService.getMetrics();
    } catch (err: any) {
      this.error = err.message || 'Error al cargar métricas del sistema.';
      // Demonstration fallback
      this.metrics = {
        totalClients: 15,
        totalAdmins: 2,
        totalCourses: 8,
        totalForumQueries: 12,
        coursesInProgress: 24,
        coursesCompleted: 42,
        coursesCanceled: 3,
        clientSatisfactionRate: 98.4,
        totalRevenueUsd: 14250,
        topDemandedCourses: [
          { id: 1, name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)', price: 199.99, rating: '4.9', enrolledCount: 150, satisfaction: '99%' },
          { id: 2, name: 'Masterclass en TypeScript & Arquitectura Limpia', price: 149.50, rating: '4.9', enrolledCount: 128, satisfaction: '98%' },
          { id: 3, name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines', price: 249.00, rating: '4.8', enrolledCount: 95, satisfaction: '97%' },
          { id: 4, name: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs', price: 179.00, rating: '4.8', enrolledCount: 88, satisfaction: '96%' },
          { id: 5, name: 'Seguridad Web & Autenticación con Firebase y JWT', price: 129.99, rating: '4.7', enrolledCount: 72, satisfaction: '95%' }
        ]
      };
    } finally {
      this.loading = false;
    }
  }

  renderCharts(): void {
    setTimeout(() => {
      // 1. Gráfico Redondo de Estado de Cursos (Doughnut)
      const canvas1 = document.getElementById('coursesDoughnutChart') as HTMLCanvasElement;
      if (canvas1) {
        if (this.chart1) this.chart1.destroy();
        this.chart1 = new Chart(canvas1, {
          type: 'doughnut',
          data: {
            labels: ['Finalizados', 'En Curso', 'Inscriptos', 'Anulados'],
            datasets: [{
              data: [
                this.metrics?.coursesCompleted || 42,
                this.metrics?.coursesInProgress || 24,
                this.enrollments.length || 15,
                this.metrics?.coursesCanceled || 3
              ],
              backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
              borderWidth: 2,
              borderColor: '#1e293b'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', font: { size: 12, weight: 'bold' } }
              }
            }
          }
        });
      }

      // 2. Gráfico Redondo de Satisfacción de Alumnos (Pie)
      const canvas2 = document.getElementById('satisfactionPieChart') as HTMLCanvasElement;
      if (canvas2) {
        if (this.chart2) this.chart2.destroy();
        this.chart2 = new Chart(canvas2, {
          type: 'pie',
          data: {
            labels: ['5 Estrellas (Excelente)', '4 Estrellas (Muy Bueno)', '3 Estrellas (Bueno)', '1-2 Estrellas'],
            datasets: [{
              data: [82, 12, 4, 2],
              backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
              borderWidth: 2,
              borderColor: '#1e293b'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', font: { size: 12, weight: 'bold' } }
              }
            }
          }
        });
      }
    }, 200);
  }

  exportReportCsv(): void {
    if (this.metrics) {
      this.csvExport.exportMetricsToCsv(this.metrics);
    }
  }

  exportReportPdf(): void {
    if (this.metrics) {
      this.pdfExport.generateMetricsPdf(this.metrics);
    }
  }
}
