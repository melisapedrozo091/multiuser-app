import { Injectable } from '@angular/core';
import { Product } from '../models/app-models';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  /**
   * Exporta la lista de productos/cursos a un archivo CSV descargable.
   */
  exportProductsToCsv(products: Product[], filename: string = 'catalogo_cursos_academia.csv'): void {
    if (!products || products.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Descripcion', 'Precio', 'Stock', 'Fecha de Registro'];
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

  /**
   * Exporta el informe de métricas del sistema a CSV.
   */
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

  /**
   * Descarga una plantilla de ejemplo en CSV para que cualquier Administrador pueda importar nuevos cursos.
   */
  downloadSampleCsvTemplate(): void {
    const sampleCsv = `Nombre,Descripcion,Precio,Stock
"Masterclass en GraphQL & Apollo Server 2026","Construye APIs eficientes con GraphQL y resolvers en tiempo real.",159.99,40
"Curso de Microservicios con NestJS y RabbitMQ","Arquitectura distribuida y mensajería Event-Driven.",189.00,30
"Python para Data Science & Machine Learning","Fundamentos de pandas, numpy, scikit-learn y modelos predictivos.",120.00,50`;

    this.downloadCsv(sampleCsv, 'plantilla_importacion_cursos.csv');
  }

  /**
   * Parsea un texto en formato CSV o JSON a una lista de objetos de cursos validables.
   */
  parseCsvToCourses(csvText: string): any[] {
    const trimmed = csvText.trim();
    if (!trimmed) return [];

    // Intento 1: Si comienza con '[' es formato JSON
    if (trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // continuar a parser CSV si falla
      }
    }

    // Intento 2: Parser CSV por líneas
    const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const courses: any[] = [];
    let startIdx = 0;

    // Detectar si la primera línea contiene encabezados
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes('nombre') || firstLineLower.includes('curso') || firstLineLower.includes('precio')) {
      startIdx = 1; // saltar encabezado
    }

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Regex para separar comas respetando comillas
      const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

      if (cleanParts.length >= 2) {
        const name = cleanParts[0];
        const description = cleanParts.length >= 4 ? cleanParts[1] : 'Curso importado masivamente en formato CSV.';
        const price = cleanParts.length >= 4 ? parseFloat(cleanParts[2]) : parseFloat(cleanParts[1]);
        const stock = cleanParts.length >= 4 ? parseInt(cleanParts[3], 10) : (cleanParts.length >= 3 ? parseInt(cleanParts[2], 10) : 50);

        if (name && !isNaN(price)) {
          courses.push({
            name,
            description: description || 'Curso importado mediante CSV.',
            price: price || 99.99,
            stock: isNaN(stock) ? 50 : stock
          });
        }
      }
    }

    return courses;
  }

  private downloadCsv(csvContent: string, filename: string): void {
    // \uFEFF (UTF-8 BOM) indica a Microsoft Excel que el archivo está en UTF-8, evitando caracteres raros (mojibake)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
