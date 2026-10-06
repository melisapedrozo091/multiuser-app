import { Injectable } from '@angular/core';
import { ChatMessage } from '../models/app-models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private auth: AuthService) {}

  private getHeaders(): HeadersInit {
    const token = this.auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getMessages(): Promise<ChatMessage[]> {
    const res = await fetch(`${environment.apiBase}/chat`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Error al cargar mensajes del chat');
    return res.json();
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    const res = await fetch(`${environment.apiBase}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al enviar mensaje');
    }
    return res.json();
  }
}
