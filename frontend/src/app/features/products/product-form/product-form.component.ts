import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEdit = false;
  productId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = Number(idParam);
      await this.loadProduct(this.productId);
    }
  }

  async loadProduct(id: number): Promise<void> {
    this.loading = true;
    try {
      const product = await this.productService.getById(id);
      this.productForm.patchValue({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock
      });
    } catch (err: any) {
      this.error = 'No se pudo cargar el producto para editar. Verifica que exista.';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) return;

    this.loading = true;
    this.error = null;

    try {
      if (this.isEdit && this.productId) {
        await this.productService.update(this.productId, this.productForm.value);
      } else {
        await this.productService.create(this.productForm.value);
      }
      this.router.navigate(['/products']);
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error al guardar';
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}
