import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatMessage, CourseReview } from '../../../core/models/app-models';
import { ChatService } from '../../../core/services/chat.service';
import { ReviewService } from '../../../core/services/review.service';
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

  newMessage = '';
  loading = false;
  sending = false;

  selectedCourseFilter = 'TODOS';

  constructor(
    private chatService: ChatService,
    private reviewService: ReviewService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadMessages(),
      this.loadReviews()
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
}
