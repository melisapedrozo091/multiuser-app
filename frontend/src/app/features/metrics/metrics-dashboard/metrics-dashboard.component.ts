import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.css']
})
export class MetricsDashboardComponent implements OnInit {
  salesData = [
    { month: 'Enero', total: 4200, count: 28 },
    { month: 'Febrero', total: 5800, count: 35 },
    { month: 'Marzo', total: 7100, count: 42 },
    { month: 'Abril', total: 6400, count: 39 },
    { month: 'Mayo', total: 8900, count: 54 },
    { month: 'Junio', total: 9500, count: 61 }
  ];

  topRatings = [
    { product: 'Servicio Cloud Premium', rating: 4.9, reviews: 124 },
    { product: 'Licencia Software Enterprise', rating: 4.7, reviews: 88 },
    { product: 'Consultoría DevOps (Hora)', rating: 4.8, reviews: 56 },
    { product: 'Paquete de Mantenimiento', rating: 4.5, reviews: 31 }
  ];

  maxSales = 10000;

  ngOnInit(): void {}
}
