import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface FaqCategory {
  name: string;
  icon: string;
  items: { question: string; answer: string; open: boolean }[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  searchText = '';

  categories: FaqCategory[] = [
    {
      name: 'Preguntas Generales & Acceso',
      icon: '🎓',
      items: [
        {
          question: '¿Cómo funciona la plataforma de cursos online?',
          answer: 'Nuestra plataforma te brinda acceso a cursos de desarrollo web, tecnología e inteligencia artificial. Puedes explorar todos los cursos y temarios sin costo. Al inscribirte, obtienes acceso ilimitado a las clases grabadas, materiales prácticos y foros de consulta.',
          open: true
        },
        {
          question: '¿Necesito iniciar sesión para explorar la plataforma?',
          answer: 'No. El catálogo de cursos, temarios, guías y el foro de la comunidad están abiertos para lectura de todo el público. Únicamente se solicita iniciar sesión cuando deseas inscribirte a un curso o publicar preguntas en el foro.',
          open: false
        }
      ]
    },
    {
      name: 'Certificados & Evaluación',
      icon: '📜',
      items: [
        {
          question: '¿Los cursos entregan Certificado Oficial?',
          answer: 'Sí. Al completar el 100% de los módulos y presentar el proyecto final de cada curso, se emite automáticamente un Certificado Digital con código QR de validación internacional.',
          open: false
        },
        {
          question: '¿Cuánto tiempo tengo para completar un curso?',
          answer: 'El acceso a los cursos es de por vida. Puedes avanzar a tu propio ritmo sin presiones ni fechas de vencimiento impuestas.',
          open: false
        }
      ]
    },
    {
      name: 'Medios de Pago & Facturación',
      icon: '💳',
      items: [
        {
          question: '¿En qué moneda puedo abonar?',
          answer: 'Puedes abonar en Dólares (USD) mediante tarjeta de crédito/débito o en Pesos Argentinos (ARS) a través de transferencia bancaria y MercadoPago. Utiliza nuestro selector de moneda en el catálogo para alternar.',
          open: false
        },
        {
          question: '¿Cómo funciona el Botón de Arrepentimiento?',
          answer: 'Conforme a la Ley de Defensa del Consumidor, contás con 10 días corridos desde la compra para solicitar la cancelación y el reintegro total del 100% de tu dinero mediante nuestro Botón de Arrepentimiento.',
          open: false
        }
      ]
    },
    {
      name: 'Soporte & Contactos',
      icon: '📞',
      items: [
        {
          question: '¿A dónde me comunico si tengo dudas sobre un curso?',
          answer: 'Puedes comunicarte con Atención al Cliente (0810-333-TECH), Ventas (ventas@academiatech.com) o Soporte Técnico (soporte@academiatech.com). También podés consultar en el Foro público.',
          open: false
        }
      ]
    }
  ];

  toggleItem(catIndex: number, itemIndex: number): void {
    this.categories[catIndex].items[itemIndex].open = !this.categories[catIndex].items[itemIndex].open;
  }
}
