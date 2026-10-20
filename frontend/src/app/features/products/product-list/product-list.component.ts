import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/app-models';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CsvExportService } from '../../../core/services/csv-export.service';
import { AdminService } from '../../../core/services/admin.service';
import { FilterPipe } from '../../../core/pipes/filter.pipe';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

import { CurrencyService, CurrencyMode } from '../../../core/services/currency.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';

export interface CourseSyllabus {
  author: string;
  supportEmail: string;
  supportPhone: string;
  modules: { title: string; lessons: string[] }[];
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, ProductCardComponent, RouterLink],
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

  // Mini Checkout State
  selectedPaymentMethod: 'CREDITO' | 'DEBITO' | 'MERCADOPAGO' | 'TRANSFERENCIA' = 'CREDITO';
  userSavedCards: { id: string; type: string; last4: string; holder: string; isDefault: boolean }[] = [];
  selectedSavedCardId = '';
  isEnteringNewCard = false;

  cardHolder = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  saveCardForFuture = true;

  // Institucional data
  readonly mpAlias = 'ACADEMIA.TECH.MP';
  readonly mpCvu = '0000003100098472918301';
  readonly mpHolder = 'Academia Tech S.A. (CUIT 30-71649281-9)';

  readonly bankName = 'Banco Santander Río';
  readonly bankAlias = 'ACADEMIA.TECH.OFICIAL';
  readonly bankCbu = '0720194888000036291045';
  readonly institutionPhone = '+54 9 11 2345-6789';

  checkoutProcessing = false;
  checkoutSuccess = false;
  lastEnrollmentResult: any = null;
  checkoutError: string | null = null;
  aliasCopied = false;

  // CSV Import State
  showImportModal = false;
  importCsvText = '';
  importing = false;
  importSuccessMsg: string | null = null;
  importErrorMsg: string | null = null;

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
      answer: 'Sí, al finalizar el 100% de las clases y proyectos prácticos se te emite un certificado digital con Certificación Oficial.',
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

  private enrollmentService = inject(EnrollmentService);
  private pdfExport = inject(PdfExportService);

  constructor(
    private productService: ProductService,
    public auth: AuthService,
    public currencyService: CurrencyService,
    private csvExport: CsvExportService,
    private adminService: AdminService,
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

  private readonly DELETED_PRODUCTS_KEY = 'deleted_courses_front_ids';

  private getDeletedProductIds(): number[] {
    const raw = localStorage.getItem(this.DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveDeletedProductId(id: number): void {
    const ids = this.getDeletedProductIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(this.DELETED_PRODUCTS_KEY, JSON.stringify(ids));
    }
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
      // Filtrar los cursos eliminados de la interfaz (manteniéndolos en la BD)
      const deletedIds = this.getDeletedProductIds();
      this.products = this.products.filter(p => !deletedIds.includes(p.id));
      this.loading = false;
    }
  }

  goToFaq(): void {
    this.router.navigate(['/faq']);
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  exportCsv(): void {
    this.csvExport.exportProductsToCsv(this.filteredProducts);
  }

  // --- CSV IMPORT (SOLO FORMATO CSV) ---
  openImportModal(): void {
    this.showImportModal = true;
    this.importCsvText = '';
    this.importSuccessMsg = null;
    this.importErrorMsg = null;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importCsvText = '';
    this.importSuccessMsg = null;
    this.importErrorMsg = null;
  }

  downloadSampleCsv(): void {
    this.csvExport.downloadSampleCsvTemplate();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.importCsvText = (e.target?.result as string) || '';
      };
      reader.readAsText(file);
    }
  }

  async onProcessImport(): Promise<void> {
    if (!this.importCsvText.trim()) {
      this.importErrorMsg = 'Por favor selecciona un archivo CSV o pega el contenido en la casilla.';
      return;
    }

    this.importing = true;
    this.importErrorMsg = null;
    this.importSuccessMsg = null;

    try {
      const parsedCourses = this.csvExport.parseCsvToCourses(this.importCsvText);
      if (!parsedCourses || parsedCourses.length === 0) {
        throw new Error('No se encontraron cursos válidos en el archivo CSV ingresado.');
      }

      const res = await this.adminService.importCourses(parsedCourses);
      this.importSuccessMsg = res.message;
      await this.loadProducts();
      setTimeout(() => {
        this.closeImportModal();
      }, 2000);
    } catch (err: any) {
      this.importErrorMsg = err.message || 'Error al procesar el archivo CSV de cursos.';
    } finally {
      this.importing = false;
    }
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

  // Mini Checkout Flow
  onBuyProduct(product: Product): void {
    this.enrollingCourse = product;
    if (!this.auth.currentUser) {
      this.showAuthModal = true;
      return;
    }

    // Regla: Una sola inscripción por curso por usuario
    if (this.enrollmentService.isUserEnrolled(this.auth.currentUser.email, product.id)) {
      this.router.navigate(['/profile'], { queryParams: { tab: 'cursos' } });
      return;
    }

    this.showCheckoutModal = true;
    this.checkoutProcessing = false;
    this.checkoutSuccess = false;
    this.checkoutError = null;
    this.aliasCopied = false;
    this.selectedPaymentMethod = 'CREDITO';

    // Cargar medios de pago guardados del usuario
    const userEmail = this.auth.currentUser.email || 'default';
    const rawCards = localStorage.getItem(`payment_methods_${userEmail}`);
    if (rawCards) {
      try {
        this.userSavedCards = JSON.parse(rawCards);
      } catch (e) {
        this.userSavedCards = [];
      }
    } else {
      this.userSavedCards = [];
    }

    if (this.userSavedCards.length > 0) {
      this.selectedSavedCardId = this.userSavedCards[0].id;
      this.isEnteringNewCard = false;
    } else {
      this.selectedSavedCardId = 'NEW';
      this.isEnteringNewCard = true;
    }

    this.cardHolder = this.auth.currentUser.displayName || '';
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.saveCardForFuture = true;
  }

  selectPaymentMethod(method: 'CREDITO' | 'DEBITO' | 'MERCADOPAGO' | 'TRANSFERENCIA'): void {
    this.selectedPaymentMethod = method;
    this.checkoutError = null;
  }

  onSelectCard(cardId: string): void {
    this.selectedSavedCardId = cardId;
    this.isEnteringNewCard = (cardId === 'NEW');
  }

  isCardValid(): boolean {
    if (!this.isEnteringNewCard) {
      return !!this.selectedSavedCardId && this.selectedSavedCardId !== 'NEW';
    }
    const cleanNum = this.cardNumber.replace(/\s/g, '');
    const cleanHolder = this.cardHolder.trim();
    const cleanExp = this.cardExpiry.trim();
    const cleanCvv = this.cardCvv.trim();

    return cleanNum.length >= 15 && cleanHolder.length >= 3 && cleanExp.length >= 4 && cleanCvv.length >= 3;
  }

  get canConfirmPayment(): boolean {
    if (this.selectedPaymentMethod === 'CREDITO' || this.selectedPaymentMethod === 'DEBITO') {
      return this.isCardValid();
    }
    return true;
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.aliasCopied = true;
      setTimeout(() => this.aliasCopied = false, 2500);
    }
  }

  confirmCheckout(): void {
    if (!this.enrollingCourse || !this.auth.currentUser) return;

    if ((this.selectedPaymentMethod === 'CREDITO' || this.selectedPaymentMethod === 'DEBITO') && !this.isCardValid()) {
      this.checkoutError = '⚠️ Debes ingresar los datos completos de tu tarjeta (o seleccionar una guardada) para poder efectuar el pago.';
      return;
    }

    this.checkoutProcessing = true;
    this.checkoutError = null;

    // Si ingresó una tarjeta nueva, guardarla en su perfil
    if (this.isEnteringNewCard && (this.selectedPaymentMethod === 'CREDITO' || this.selectedPaymentMethod === 'DEBITO')) {
      const cleanNum = this.cardNumber.replace(/\s/g, '');
      const last4 = cleanNum.slice(-4) || '8842';
      const cardType = cleanNum.startsWith('4') ? 'VISA' : (cleanNum.startsWith('5') ? 'MASTERCARD' : (this.selectedPaymentMethod === 'CREDITO' ? 'VISA' : 'MASTERCARD'));

      const newCard = {
        id: Date.now().toString(),
        type: cardType,
        last4: last4,
        holder: this.cardHolder.trim() || (this.auth.currentUser.displayName || 'Titular Registrado'),
        isDefault: this.userSavedCards.length === 0
      };

      if (this.saveCardForFuture || this.userSavedCards.length === 0) {
        this.userSavedCards.push(newCard);
        const userEmail = this.auth.currentUser.email || 'default';
        localStorage.setItem(`payment_methods_${userEmail}`, JSON.stringify(this.userSavedCards));
      }
    }

    // Nombre legible del medio de pago utilizado
    let methodLabel = '';
    if (this.selectedPaymentMethod === 'CREDITO') {
      const last4 = this.isEnteringNewCard 
        ? this.cardNumber.replace(/\s/g, '').slice(-4) 
        : (this.userSavedCards.find(c => c.id === this.selectedSavedCardId)?.last4 || '4821');
      methodLabel = `Tarjeta de Crédito (•••• ${last4})`;
    } else if (this.selectedPaymentMethod === 'DEBITO') {
      const last4 = this.isEnteringNewCard 
        ? this.cardNumber.replace(/\s/g, '').slice(-4) 
        : (this.userSavedCards.find(c => c.id === this.selectedSavedCardId)?.last4 || '4821');
      methodLabel = `Tarjeta de Débito (•••• ${last4})`;
    } else if (this.selectedPaymentMethod === 'MERCADOPAGO') {
      methodLabel = `Mercado Pago (Alias: ${this.mpAlias})`;
    } else {
      methodLabel = `Transferencia Bancaria (WhatsApp: ${this.institutionPhone})`;
    }

    const currentCurr = this.currencyService.currentCurrency;

    // Registrar inscripción permanente
    const enrollment = this.enrollmentService.registerEnrollment(
      this.enrollingCourse,
      this.auth.currentUser,
      methodLabel,
      currentCurr
    );

    this.lastEnrollmentResult = enrollment;

    setTimeout(() => {
      this.checkoutProcessing = false;
      this.checkoutSuccess = true;
    }, 700);
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
    this.checkoutProcessing = false;
    this.checkoutSuccess = false;
    this.checkoutError = null;
  }

  goToProfilePayments(): void {
    this.closeCheckoutModal();
    this.router.navigate(['/profile'], { queryParams: { tab: 'pagos' } });
  }

  goToProfileCourses(): void {
    this.closeCheckoutModal();
    this.router.navigate(['/profile'], { queryParams: { tab: 'cursos' } });
  }

  downloadReceiptPdf(): void {
    if (!this.lastEnrollmentResult || !this.auth.currentUser) return;
    const clientName = this.auth.currentUser.displayName || 'Cliente Registrado';
    const clientEmail = this.auth.currentUser.email || '';
    const invoice = {
      id: 'FAC-' + this.lastEnrollmentResult.id.replace('INS-', ''),
      date: this.lastEnrollmentResult.date,
      concept: `Inscripción Oficial: ${this.lastEnrollmentResult.courseName}`,
      amount: `$ ${this.lastEnrollmentResult.price.toFixed(2)} ${this.lastEnrollmentResult.currency}`,
      status: 'Pagado'
    };
    this.pdfExport.generateInvoicePdf(clientName, clientEmail, invoice);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  async onDeleteProduct(id: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este curso del catálogo visible? (En la base de datos se conservará íntegro).')) {
      // 1. Eliminar inmediatamente de la lista visible
      this.products = this.products.filter(p => p.id !== id);
      // 2. Guardar en almacenamiento para que permanezca oculto en frontend
      this.saveDeletedProductId(id);
      // 3. Sincronizar suavemente con backend (sin destruir datos en BD)
      await this.productService.delete(id);
    }
  }

  get isAdmin(): boolean {
    return this.auth.currentUser?.role === 'ADMIN';
  }
}
