import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/app-models';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CsvExportService } from '../../../core/services/csv-export.service';
import { FilterPipe } from '../../../core/pipes/filter.pipe';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchText = '';
  loading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    public auth: AuthService,
    private csvExport: CsvExportService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    try {
      this.products = await this.productService.getAll();
    } catch (err: any) {
      this.error = 'No se pudieron cargar los productos del backend.';
      // Seed initial sample data if backend DB is empty or disconnected
      this.products = [
        { id: 1, name: 'Servicio Cloud Premium', description: 'Infraestructura en la nube con alta disponibilidad 99.9%', price: 299.99, stock: 15 },
        { id: 2, name: 'Licencia Software Enterprise', description: 'Acceso ilimitado a herramientas de auditoría', price: 899.00, stock: 3 },
        { id: 3, name: 'Consultoría DevOps (Hora)', description: 'Asesoramiento técnico personalizado por expertos', price: 120.00, stock: 25 },
        { id: 4, name: 'Paquete de Mantenimiento', description: 'Soporte 24/7 y actualizaciones críticas', price: 450.00, stock: 2 }
      ];
    } finally {
      this.loading = false;
    }
  }

  exportCsv(): void {
    const filterPipe = new FilterPipe();
    const filtered = filterPipe.transform(this.products, this.searchText, ['name', 'description']);
    this.csvExport.exportProductsToCsv(filtered);
  }

  onBuyProduct(product: Product): void {
    alert(`¡Gracias por adquirir "${product.name}" por $${product.price}!`);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  async onDeleteProduct(id: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await this.productService.delete(id);
        this.products = this.products.filter(p => p.id !== id);
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  }

  get isAdmin(): boolean {
    return this.auth.currentUser?.role === 'ADMIN';
  }
}
