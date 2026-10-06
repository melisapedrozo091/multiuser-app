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

import { CurrencyService, CurrencyMode } from '../../../core/services/currency.service';

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
  selectedCategory = 'TODOS';
  loading = true;
  error: string | null = null;

  categories = [
    { label: 'Todos los Cursos', value: 'TODOS', icon: '🌟' },
    { label: 'Fullstack & Web', value: 'FULLSTACK', icon: '💻' },
    { label: 'TypeScript', value: 'TYPESCRIPT', icon: '⚡' },
    { label: 'DevOps & Cloud', value: 'DEVOPS', icon: '🐳' },
    { label: 'Inteligencia Artificial', value: 'IA', icon: '🤖' },
    { label: 'Seguridad', value: 'SEGURIDAD', icon: '🛡️' }
  ];

  constructor(
    private productService: ProductService,
    public auth: AuthService,
    public currencyService: CurrencyService,
    private csvExport: CsvExportService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  setCurrency(mode: CurrencyMode): void {
    this.currencyService.setCurrency(mode);
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  get filteredProducts(): Product[] {
    const filterPipe = new FilterPipe();
    let list = filterPipe.transform(this.products, this.searchText, ['name', 'description']);

    if (this.selectedCategory !== 'TODOS') {
      list = list.filter(p => {
        const name = p.name.toLowerCase();
        if (this.selectedCategory === 'FULLSTACK') return name.includes('fullstack') || name.includes('web');
        if (this.selectedCategory === 'TYPESCRIPT') return name.includes('typescript') || name.includes('código');
        if (this.selectedCategory === 'DEVOPS') return name.includes('devops') || name.includes('docker');
        if (this.selectedCategory === 'IA') return name.includes('inteligencia') || name.includes('ia');
        if (this.selectedCategory === 'SEGURIDAD') return name.includes('seguridad') || name.includes('auth');
        return true;
      });
    }

    return list;
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    try {
      this.products = await this.productService.getAll();
    } catch (err: any) {
      this.error = 'No se pudieron cargar los productos del backend.';
      this.products = [];
    } finally {
      this.loading = false;
    }
  }

  exportCsv(): void {
    this.csvExport.exportProductsToCsv(this.filteredProducts);
  }

  onBuyProduct(product: Product): void {
    const formattedPrice = this.currencyService.format(product.price);
    alert(`🎓 ¡Felicidades! Te has inscrito en "${product.name}" por ${formattedPrice}. Revisa tu correo para el acceso a las clases.`);
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
