import { Injectable } from '@angular/core';
import { Product } from '../models/app-models';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  exportProductsToCsv(products: Product[], filename: string = 'catalogo_productos.csv'): void {
    if (!products || products.length === 0) {
      alert('No hay productos para exportar.');
      return;
    }

    const headers = ['ID', 'Nombre', 'Descripción', 'Precio ($)', 'Stock', 'Fecha de Creación'];
    const rows = products.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price,
      p.stock,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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
