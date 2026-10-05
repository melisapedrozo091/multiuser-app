import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/app-models';
import { HighlightDirective } from '../../../core/directives/highlight.directive';

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
