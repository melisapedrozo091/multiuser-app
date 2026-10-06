import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/app-models';
import { HighlightDirective } from '../../../core/directives/highlight.directive';

import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, HighlightDirective],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() isAdmin = false;

  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<number>();
  @Output() buy = new EventEmitter<Product>();
  @Output() viewDetail = new EventEmitter<Product>();

  constructor(
    public currencyService: CurrencyService,
    public auth: AuthService
  ) {}

  downloadSyllabusPdf(): void {
    const user = this.auth.currentUser;
    const content = `
====================================================
     ACADEMIA TECH - PLAN DE ESTUDIOS OFICIAL
====================================================
Curso: ${this.product.name}
Descripción: ${this.product.description || 'Sin descripción'}
Estudiante: ${user?.displayName || user?.email || 'Alumno Registrado'}
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}
----------------------------------------------------

PROGRAMA ACADÉMICO Y TEMARIO:

1. MÓDULO 1: FUNDAMENTOS Y ARQUITECTURA BASE
   - Introducción a las herramientas y entorno de trabajo
   - Principios SOLID, patrones de diseño y estructura limpia

2. MÓDULO 2: DESARROLLO PRÁCTICO Y PROYECTO
   - Implementación de controladores REST y lógica de negocio
   - Autenticación segura, verificación de JWT y roles de usuario

3. MÓDULO 3: DESPLIEGUE, PRUEBAS Y CERTIFICACIÓN
   - Optimización de rendimiento, pruebas de calidad y deployment
   - Proyecto final integrado y emisión de Certificado Oficial

----------------------------------------------------
Soporte Académico: soporte@academiatech.com
Atención al Cliente: 0810-333-TECH (8324)
====================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plan_de_Estudios_${this.product.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.product);
  }

  get formattedPrice(): string {
    return this.currencyService.format(this.product.price);
  }

  get categoryIcon(): string {
    const name = this.product.name.toLowerCase();
    if (name.includes('fullstack') || name.includes('web')) return '💻';
    if (name.includes('typescript') || name.includes('código')) return '⚡';
    if (name.includes('datos') || name.includes('prisma')) return '🗄️';
    if (name.includes('devops') || name.includes('docker')) return '🐳';
    if (name.includes('inteligencia') || name.includes('ia')) return '🤖';
    if (name.includes('seguridad') || name.includes('auth')) return '🛡️';
    if (name.includes('diseño') || name.includes('css')) return '🎨';
    return '🎓';
  }

  get ratingStars(): string {
    return '⭐ 4.9 (120+ alumnos)';
  }

  onEdit(): void {
    this.edit.emit(this.product);
  }

  onDelete(): void {
    this.delete.emit(this.product.id);
  }

  onBuy(): void {
    this.buy.emit(this.product);
  }
}
