import { Injectable } from '@angular/core';
import { Product } from '../models/app-models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private auth: AuthService) {}

  private getHeaders(): HeadersInit {
    const token = this.auth.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(): Promise<Product[]> {
    const res = await fetch(`${environment.apiBase}/products`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al cargar productos');
    return res.json();
  }

  async create(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${environment.apiBase}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Error al crear producto');
    return res.json();
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${environment.apiBase}/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Error al actualizar producto');
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${environment.apiBase}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar producto');
  }
}
