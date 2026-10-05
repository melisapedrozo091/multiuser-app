export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'ADMIN' | 'CLIENTE';
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  ownerId?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  message: string;
  timestamp: string;
}
