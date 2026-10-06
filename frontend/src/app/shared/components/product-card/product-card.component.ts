import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/app-models';
import { HighlightDirective } from '../../../core/directives/highlight.directive';

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

  constructor(public currencyService: CurrencyService) {}

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
