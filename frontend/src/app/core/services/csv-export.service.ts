import { Injectable } from '@angular/core';
import { Product } from '../models/app-models';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  exportProductsToCsv(products: Product[], filename: string = 'catalogo_cursos_academia.csv'): void {
    if (!products || products.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['ID', 'Curso / Programa', 'Descripción', 'Precio', 'Vacantes / Stock', 'Fecha de Registro'];
    const rows = products.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price,
      p.stock,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
    ]);

    this.downloadCsv([headers.join(','), ...rows.map(e => e.join(','))].join('\n'), filename);
  }

  exportMetricsToCsv(metricsData: any, filename: string = 'informe_metricas_globales.csv'): void {
    if (!metricsData) return;

    const csvRows = [
      '====================================================',
      'INFORME DE MÉTRICAS Y ESTADÍSTICAS GLOBALES - ACADEMIA TECH',
      `Fecha de Generación: ${new Date().toLocaleString('es-AR')}`,
      '====================================================',
      '',
      'INDICADOR / MÉTRICA,VALOR O REGISTRO',
      `Clientes Registrados,${metricsData.totalClients}`,
      `Administradores de Sistema,${metricsData.totalAdmins}`,
      `Total Cursos en Catálogo,${metricsData.totalCourses}`,
      `Consultas en Foro Comunidad,${metricsData.totalForumQueries}`,
      `Cursos en Curso (Activos),${metricsData.coursesInProgress}`,
      `Cursos Finalizados (Certificados),${metricsData.coursesCompleted}`,
      `Cursos Anulados (Arrepentimiento),${metricsData.coursesCanceled}`,
      `Índice de Satisfacción del Cliente,${metricsData.clientSatisfactionRate}%`,
      `Ingresos Brutos Estimados,USD $${metricsData.totalRevenueUsd}`,
      '',
      'CURSOS MÁS SOLICITADOS / POPULARES (RANKING DE DEMANDA)',
      'ID,Nombre del Curso,Precio ($),Valoración (Estrellas),Inscriptos,Satisfacción'
    ];

    if (metricsData.topDemandedCourses) {
      metricsData.topDemandedCourses.forEach((c: any) => {
        csvRows.push(`${c.id},"${c.name.replace(/"/g, '""')}",${c.price},${c.rating} ⭐,${c.enrolledCount} alumnos,${c.satisfaction}`);
      });
    }

    this.downloadCsv(csvRows.join('\n'), filename);
  }

  private downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
