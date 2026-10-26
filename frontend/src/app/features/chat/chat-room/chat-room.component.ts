import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatMessage, CourseReview, Product } from '../../../core/models/app-models';
import { ChatService } from '../../../core/services/chat.service';
import { ReviewService } from '../../../core/services/review.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  messages: ChatMessage[] = [];
  reviews: CourseReview[] = [];
  availableCourses: Product[] = [];

  newMessage = '';
  loading = false;
  sending = false;

  // Active view tab
  activeTab: 'reviews' | 'chat' | 'all' = 'reviews';
  selectedCourseFilter = 'TODOS';

  // Review modal inside the forum
  showReviewModal = false;
  selectedCourseId: number | null = null;
  newRating = 5;
  newReviewComment = '';
  savingReview = false;
  reviewFeedback: string | null = null;
  reviewError: string | null = null;

  constructor(
    private chatService: ChatService,
    private reviewService: ReviewService,
    private productService: ProductService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadMessages(),
      this.loadReviews(),
      this.loadCourses()
    ]);
  }

  async loadMessages(): Promise<void> {
    this.loading = true;
    try {
      this.messages = await this.chatService.getMessages();
    } catch (err) {
      this.messages = [
        { id: '1', senderUid: 'system', senderName: 'Soporte de la Academia', message: '¡Bienvenido al foro comunitario! Aquí puedes compartir consultas, dudas técnicas e interactuar con otros alumnos y profesores.', timestamp: new Date().toISOString() },
        { id: '2', senderUid: 'usr_2', senderName: 'Carlos Mendoza', message: '¿Alguien tiene apuntes extra del módulo de microservicios con Docker?', timestamp: new Date().toISOString() }
      ];
    } finally {
      this.loading = false;
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async loadReviews(): Promise<void> {
    try {
      this.reviews = await this.reviewService.getReviews();
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
    }
  }

  async loadCourses(): Promise<void> {
    try {
      this.availableCourses = await this.productService.getAll();
      if (this.availableCourses.length > 0 && !this.selectedCourseId) {
        this.selectedCourseId = this.availableCourses[0].id;
      }
    } catch (err) {
      // Fallback course list
      this.availableCourses = [
        { id: 1, name: 'Curso Completo de Desarrollo Web Fullstack', price: 99.99, stock: 50 },
        { id: 2, name: 'Python para Ciencia de Datos e Inteligencia Artificial', price: 129.99, stock: 40 },
        { id: 3, name: 'Diseño UX/UI & Prototipado con Figma Avanzado', price: 79.99, stock: 35 },
        { id: 4, name: 'DevOps: Docker, Kubernetes & CI/CD Pipelines', price: 149.99, stock: 25 },
        { id: 5, name: 'Arquitectura Cloud con AWS & Microservicios', price: 179.99, stock: 30 },
        { id: 6, name: 'Ciberseguridad Ofensiva & Hacking Ético', price: 199.99, stock: 20 }
      ];
      this.selectedCourseId = 1;
    }
  }

  get uniqueCourseNames(): string[] {
    const list = this.reviews.map(r => r.courseName).filter(Boolean);
    return Array.from(new Set(list));
  }

  get filteredReviews(): CourseReview[] {
    if (this.selectedCourseFilter === 'TODOS') {
      return this.reviews;
    }
    return this.reviews.filter(r => r.courseName === this.selectedCourseFilter);
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 5.0;
    const total = this.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return Number((total / this.reviews.length).toFixed(1));
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: Math.min(Math.max(count, 1), 5) });
  }

  getEmptyStarsArray(count: number): number[] {
    const emptyCount = 5 - Math.min(Math.max(count, 1), 5);
    return Array.from({ length: Math.max(0, emptyCount) });
  }

  getInitials(name: string): string {
    if (!name) return 'AL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  scrollToBottom(): void {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  async onSend(): Promise<void> {
    if (!this.newMessage.trim() || this.sending) return;

    const text = this.newMessage;
    this.newMessage = '';
    this.sending = true;

    try {
      const msg = await this.chatService.sendMessage(text);
      this.messages.push(msg);
    } catch (err) {
      const user = this.auth.currentUser;
      this.messages.push({
        id: Date.now().toString(),
        senderUid: user?.id || 'me',
        senderName: user?.displayName || user?.email || 'Yo',
        message: text,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.sending = false;
    }
    setTimeout(() => this.scrollToBottom(), 50);
  }

  // --- MODAL DE PUBLICACIÓN DE RESEÑA DESDE EL FORO ---
  openReviewModal(): void {
    this.newRating = 5;
    this.newReviewComment = '';
    this.reviewFeedback = null;
    this.reviewError = null;
    if (this.availableCourses.length > 0 && !this.selectedCourseId) {
      this.selectedCourseId = this.availableCourses[0].id;
    }
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  setRating(stars: number): void {
    this.newRating = stars;
  }

  async submitReview(): Promise<void> {
    if (!this.selectedCourseId) {
      this.reviewError = 'Por favor selecciona un curso para calificar.';
      return;
    }

    if (!this.newReviewComment.trim()) {
      this.reviewError = 'Por favor ingresa un comentario sobre tu experiencia con el curso.';
      return;
    }

    const course = this.availableCourses.find(c => c.id === Number(this.selectedCourseId));
    const courseName = course ? course.name : 'Curso de Especialización';

    this.savingReview = true;
    this.reviewError = null;

    try {
      const saved = await this.reviewService.createReview({
        courseId: Number(this.selectedCourseId),
        courseName,
        rating: this.newRating,
        comment: this.newReviewComment.trim()
      });

      // Update reviews list locally
      const existingIdx = this.reviews.findIndex(r => r.courseId === saved.courseId && r.userEmail === saved.userEmail);
      if (existingIdx !== -1) {
        this.reviews[existingIdx] = saved;
      } else {
        this.reviews.unshift(saved);
      }

      this.reviewFeedback = '¡Tu reseña se guardó correctamente en la base de datos MySQL y ya está publicada en el foro!';
      setTimeout(() => {
        this.closeReviewModal();
      }, 1500);
    } catch (err: any) {
      this.reviewError = err.message || 'Error al guardar la reseña.';
    } finally {
      this.savingReview = false;
    }
  }
}
