import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../core/models/app-models';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = false;

  constructor(
    private chatService: ChatService,
    public auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadMessages();
  }

  async loadMessages(): Promise<void> {
    try {
      this.messages = await this.chatService.getMessages();
    } catch (err) {
      this.messages = [
        { id: '1', senderUid: 'system', senderName: 'Soporte', message: '¡Bienvenido al foro / chat en vivo!', timestamp: new Date().toISOString() },
        { id: '2', senderUid: 'usr_2', senderName: 'Carlos', message: '¿Alguien sabe disponibilidad del servidor VPS?', timestamp: new Date().toISOString() }
      ];
    }
  }

  async onSend(): Promise<void> {
    if (!this.newMessage.trim()) return;

    const text = this.newMessage;
    this.newMessage = '';

    try {
      const msg = await this.chatService.sendMessage(text);
      this.messages.push(msg);
    } catch (err) {
      // Local fallback for demo
      const user = this.auth.currentUser;
      this.messages.push({
        id: Date.now().toString(),
        senderUid: user?.id || 'me',
        senderName: user?.displayName || user?.email || 'Yo',
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  }
}
