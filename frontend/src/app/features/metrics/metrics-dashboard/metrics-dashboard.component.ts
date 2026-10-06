import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardMetrics } from '../../../core/services/admin.service';
import { CsvExportService } from '../../../core/services/csv-export.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.css']
})
export class MetricsDashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  loading = true;
  error: string | null = null;

  // Import Modal State
  showImportModal = false;
  importJsonText = '';
  importing = false;
  importSuccessMsg: string | null = null;
  importErrorMsg: string | null = null;

  sampleImportJson = `[
  {
    "name": "Masterclass en GraphQL & Apollo Server 2026",
    "description": "Construye APIs eficientes con GraphQL, resolvers y subscripciones en tiempo real.",
    "price": 159.99,
    "stock": 40
  },
  {
    "name": "Curso de Microservicios con NestJS y RabbitMQ",
    "description": "Arquitectura distribuida, mensajería asíncrona y patrones Event-Driven.",
    "price": 189.00,
    "stock": 30
  }
]`;

  constructor(
    private adminService: AdminService,
    private csvExport: CsvExportService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.metrics = await this.adminService.getMetrics();
    } catch (err: any) {
      this.error = err.message || 'Error al cargar métricas del sistema.';
      // Demonstration fallback if server token fails
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

  exportReportCsv(): void {
    if (this.metrics) {
      this.csvExport.exportMetricsToCsv(this.metrics);
    }
  }

  openImportModal(): void {
    this.showImportModal = true;
    this.importJsonText = this.sampleImportJson;
    this.importSuccessMsg = null;
    this.importErrorMsg = null;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importSuccessMsg = null;
    this.importErrorMsg = null;
  }

  async onProcessImport(): Promise<void> {
    if (!this.importJsonText.trim()) {
      this.importErrorMsg = 'Ingresa el contenido JSON o CSV para importar.';
      return;
    }

    this.importing = true;
    this.importErrorMsg = null;
    this.importSuccessMsg = null;

    try {
      const parsedCourses = JSON.parse(this.importJsonText);
      const res = await this.adminService.importCourses(parsedCourses);
      this.importSuccessMsg = res.message;
      await this.loadMetrics();
      setTimeout(() => {
        this.closeImportModal();
      }, 2000);
    } catch (err: any) {
      this.importErrorMsg = err.message || 'Error al procesar el formato JSON/CSV de cursos.';
    } finally {
      this.importing = false;
    }
  }
}
