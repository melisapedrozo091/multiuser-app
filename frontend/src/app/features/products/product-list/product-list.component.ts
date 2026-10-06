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

export interface CourseSyllabus {
  author: string;
  supportEmail: string;
  supportPhone: string;
  modules: { title: string; lessons: string[] }[];
}

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

  // Modals state
  selectedCourseDetail: Product | null = null;
  enrollingCourse: Product | null = null;
  showAuthModal = false;
  showCheckoutModal = false;
  purchaseCompleted = false;

  categories = [
    { label: 'Todos los Cursos', value: 'TODOS', icon: '🌟' },
    { label: 'Fullstack & Web', value: 'FULLSTACK', icon: '💻' },
    { label: 'TypeScript', value: 'TYPESCRIPT', icon: '⚡' },
    { label: 'DevOps & Cloud', value: 'DEVOPS', icon: '🐳' },
    { label: 'Inteligencia Artificial', value: 'IA', icon: '🤖' },
    { label: 'Seguridad', value: 'SEGURIDAD', icon: '🛡️' }
  ];

  faqs = [
    {
      question: '¿Necesito iniciar sesión para ver el catálogo y temario?',
      answer: 'No, puedes explorar libremente todos los cursos, precios, temas y contenidos. Solo se requiere iniciar sesión al momento de realizar la inscripción o compra.',
      open: false
    },
    {
      question: '¿Los cursos incluyen certificado oficial?',
      answer: 'Sí, al finalizar el 100% de las clases y proyectos prácticos se te emite un certificado digital con código QR de verificación.',
      open: false
    },
    {
      question: '¿En qué moneda puedo realizar el pago?',
      answer: 'Puedes pagar en Dólares (USD) o en Pesos Argentinos (ARS). Utiliza el selector de moneda arriba en la barra para alternar.',
      open: false
    },
    {
      question: '¿Dónde realizo preguntas o resuelvo dudas?',
      answer: 'Contamos con una sección de Foro & Comunidad donde los estudiantes y tutores responden preguntas en tiempo real, además del correo de soporte.',
      open: false
    }
  ];

  defaultCourses: Product[] = [
    {
      id: 1,
      name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      description: 'Aprende a construir aplicaciones escalables de principio a fin con Angular Standalone, Express y Prisma ORM.',
      price: 199.99,
      stock: 50
    },
    {
      id: 2,
      name: 'Masterclass en TypeScript & Arquitectura Limpia',
      description: 'Domina los patrones de diseño, principios SOLID y arquitectura por capas aplicada a TypeScript.',
      price: 149.50,
      stock: 40
    },
    {
      id: 3,
      name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      description: 'Diseño de esquemas relacionales, migraciones avanzadas, optimización de queries y relaciones en Prisma.',
      price: 89.99,
      stock: 30
    },
    {
      id: 4,
      name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      description: 'Contenerización de aplicaciones, despliegue continuo en la nube y configuración de pipelines automatizados.',
      price: 249.00,
      stock: 20
    },
    {
      id: 5,
      name: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      description: 'Integración de LLMs, embeddings y herramientas de IA generativa en aplicaciones web modernas.',
      price: 179.00,
      stock: 35
    },
    {
      id: 6,
      name: 'Seguridad Web & Autenticación con Firebase y JWT',
      description: 'Implementación de roles, permisos, OAuth2, verificación de tokens y buenas prácticas de ciberseguridad.',
      price: 129.99,
      stock: 25
    },
    {
      id: 7,
      name: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      description: 'Crea interfaces responsivas, diseño dinámico, animaciones fluidas y experiencia de usuario de alto nivel.',
      price: 99.99,
      stock: 60
    },
    {
      id: 8,
      name: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      description: 'Sesión personalizada de asesoramiento en código, revisión de arquitectura y solución de dudas.',
      price: 120.00,
      stock: 15
    }
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

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
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
      const data = await this.productService.getAll();
      this.products = (data && data.length > 0) ? data : this.defaultCourses;
    } catch (err: any) {
      this.error = 'Cargando catálogo en modo demostración.';
      this.products = this.defaultCourses;
    } finally {
      this.loading = false;
    }
  }

  exportCsv(): void {
    this.csvExport.exportProductsToCsv(this.filteredProducts);
  }

  // Course Details & Syllabus
  openCourseDetail(product: Product): void {
    this.selectedCourseDetail = product;
  }

  closeCourseDetail(): void {
    this.selectedCourseDetail = null;
  }

  getSyllabus(product: Product): CourseSyllabus {
    return {
      author: 'Melisa Pedrozo & Equipo de Contenido Tech',
      supportEmail: 'soporte@academiatech.com',
      supportPhone: '+54 9 11 2345-6789',
      modules: [
        {
          title: 'Módulo 1: Fundamentos y Arquitectura Base',
          lessons: ['Introducción a la tecnología y entorno de trabajo', 'Patrones de diseño y principios de estructura limpia']
        },
        {
          title: 'Módulo 2: Desarrollo Práctico y Proyecto Guiado',
          lessons: ['Implementación de servicios y controladores REST', 'Integración de autenticación y seguridad de datos']
        },
        {
          title: 'Módulo 3: Despliegue, Pruebas y Certificación',
          lessons: ['Optimización de rendimiento y pruebas de calidad', 'Proyecto final y solicitud de Certificado Oficial']
        }
      ]
    };
  }

  // Enrollment & Checkout Guard
  onBuyProduct(product: Product): void {
    this.enrollingCourse = product;
    if (!this.auth.currentUser) {
      // Prompt user to log in first!
      this.showAuthModal = true;
    } else {
      // Show Checkout confirmation modal!
      this.showCheckoutModal = true;
      this.purchaseCompleted = false;
    }
  }

  goToLogin(): void {
    this.showAuthModal = false;
    this.router.navigate(['/login']);
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
    this.enrollingCourse = null;
  }

  closeCheckoutModal(): void {
    this.showCheckoutModal = false;
    this.enrollingCourse = null;
    this.purchaseCompleted = false;
  }

  confirmCheckout(): void {
    this.purchaseCompleted = true;
    setTimeout(() => {
      this.closeCheckoutModal();
      alert(`🎉 ¡Inscripción confirmada! Te hemos enviado el correo de bienvenida para el curso "${this.enrollingCourse?.name}".`);
    }, 1500);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  async onDeleteProduct(id: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
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
