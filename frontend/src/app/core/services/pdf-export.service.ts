import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { UserCourse } from '../../features/profile/profile.component';
import { Product } from '../models/app-models';

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  /**
   * Genera un certificado de aprobación profesional en formato PDF.
   */
  generateCertificatePdf(studentName: string, courseName: string, certificateId: string): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Decorative background border
    doc.setDrawColor(13, 110, 253); // Primary Blue
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(1);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

    // Header Logo & Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(13, 110, 253);
    doc.text('ACADEMIA TECH', pageWidth / 2, 35, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 110, 120);
    doc.text('INSTITUTO DE CAPACITACIÓN Y TECNOLOGÍA AVANZADA', pageWidth / 2, 44, { align: 'center' });

    // Decorative Horizontal Line
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(1.5);
    doc.line(pageWidth / 2 - 60, 50, pageWidth / 2 + 60, 50);

    // Main Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CERTIFICADO DE APROBACIÓN', pageWidth / 2, 68, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Se otorga el presente documento a:', pageWidth / 2, 80, { align: 'center' });

    // Student Name
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(studentName.toUpperCase(), pageWidth / 2, 96, { align: 'center' });

    // Line under student name
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 80, 100, pageWidth / 2 + 80, 100);

    // Course Name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Por haber completado con éxito la capacitación técnica profesional en:', pageWidth / 2, 112, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 110, 253);
    doc.text(`"${courseName}"`, pageWidth / 2, 126, { align: 'center' });

    // Details & Seals
    const issueDate = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`CÓDIGO DE VALIDACIÓN: ${certificateId}`, 25, 160);
    doc.text(`FECHA DE EMISIÓN: ${issueDate}`, 25, 167);
    doc.text('ESTADO: CERTIFICACIÓN OFICIAL ACREDITADA (100% COMPLETADO)', 25, 174);

    // Footer Signatures
    doc.line(190, 165, 260, 165);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Dirección Académica', 225, 172, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Academia Tech S.A.', 225, 177, { align: 'center' });

    // Save document
    const cleanFileName = courseName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Certificado_${cleanFileName}.pdf`);
  }

  /**
   * Genera un comprobante / factura de pago en formato PDF con Número de Factura y Código de Barras.
   */
  generateInvoicePdf(clientName: string, clientEmail: string, invoice: { id: string; date: string; concept: string; amount: string; status: string }): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header Background Header Bar
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIA TECH S.A.', 14, 18);

    doc.setFontSize(11);
    doc.text('FACTURA DE COMPRA DIGITAL', 196, 18, { align: 'right' });

    // Factura Metadata Header Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 34, 182, 28, 'F');
    doc.rect(14, 34, 182, 28, 'S');

    const invoiceNum = invoice.id.startsWith('FAC-') ? invoice.id : `FAC-2026-${invoice.id.padStart(6, '0')}`;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° DE FACTURA: ${invoiceNum}`, 18, 43);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${invoice.date}`, 18, 50);
    doc.text(`Estado de Transacción: ${invoice.status.toUpperCase()} (PAGO APROBADO)`, 18, 56);

    // Organization Data (Right side)
    doc.setFont('helvetica', 'bold');
    doc.text('EMISOR REGISTRADO:', 125, 43);
    doc.setFont('helvetica', 'normal');
    doc.text('Academia Tech S.A. - CUIT: 30-71234567-8', 125, 50);
    doc.text('I.V.A. Responsable Inscripto', 125, 56);

    // Customer Data Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FACTURADO A / DATOS DEL CLIENTE:', 14, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre / Titular: ${clientName}`, 14, 79);
    doc.text(`Correo Electrónico: ${clientEmail}`, 14, 85);
    doc.text('Condición de Venta: Contado / Crédito Online', 14, 91);

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 100, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Descripción del Curso / Servicio Digital', 18, 106.5);
    doc.text('Subtotal', 190, 106.5, { align: 'right' });

    // Table Content Row
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(invoice.concept, 18, 118);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.amount, 190, 118, { align: 'right' });

    // Line below row
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 125, 196, 125);

    // Total Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(120, 132, 76, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(120, 132, 76, 22, 'S');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 110, 253);
    doc.text('MONTO TOTAL:', 124, 145);
    doc.text(invoice.amount, 192, 145, { align: 'right' });

    // BARCODE SECTION (Código de Barras Vectorial Oficial)
    const barcodeStartY = 175;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('CÓDIGO DE BARRAS FISCAL & AUTENTICIDAD DIGITAL:', 14, barcodeStartY - 4);

    // Draw Barcode Lines (Simulating Code128 format)
    doc.setFillColor(0, 0, 0);
    const barcodeX = 14;
    const barcodeHeight = 16;
    const pattern = [3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 1, 2, 3, 2, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 3, 2, 1, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3];
    let currX = barcodeX;

    pattern.forEach((w, idx) => {
      if (idx % 2 === 0) {
        doc.rect(currX, barcodeStartY, w * 0.85, barcodeHeight, 'F');
      }
      currX += w * 0.85 + 0.6;
    });

    // Barcode Numerical string under bars
    const cleanNum = invoiceNum.replace(/[^0-9]/g, '') || '30712345678';
    const fullBarcodeDigits = `779${cleanNum}2026100609`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`* ${fullBarcodeDigits} *`, barcodeX + 25, barcodeStartY + barcodeHeight + 5);

    // CAE / Tax Authorization Details
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`C.A.E. N°: 76481290384192`, 140, barcodeStartY + 4);
    doc.text(`Vencimiento C.A.E.: 16/10/2026`, 140, barcodeStartY + 9);
    doc.text(`Comprobante Autorizado por AFIP / DGI`, 140, barcodeStartY + 14);

    // Footer Legal Notice
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Este documento sirve como comprobante legal y fiscal de pago de capacitaciones digitales en Academia Tech S.A.', 105, 260, { align: 'center' });

    doc.save(`Factura_${invoiceNum}.pdf`);
  }

  /**
   * Genera un informe completo de Métricas Ejecutivas en formato PDF para Administradores.
   */
  generateMetricsPdf(metrics: any): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIA TECH - INFORME EJECUTIVO DE MÉTRICAS', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Fecha de reporte: ${new Date().toLocaleString('es-AR')}`, 14, 26);

    // Summary Cards Grid
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('Resumen General del Sistema', 14, 44);

    const cards = [
      { label: 'Clientes Registrados', val: `${metrics.totalClients}` },
      { label: 'Administradores', val: `${metrics.totalAdmins}` },
      { label: 'Cursos Activos', val: `${metrics.coursesInProgress}` },
      { label: 'Certificados Emitidos', val: `${metrics.coursesCompleted}` },
      { label: 'Satisfacción Global', val: `${metrics.clientSatisfactionRate}%` },
      { label: 'Ingresos Estimados', val: `USD $${metrics.totalRevenueUsd}` }
    ];

    let startX = 14;
    let startY = 50;
    const cardW = 56;
    const cardH = 22;

    cards.forEach((card, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * (cardW + 7);
      const y = startY + row * (cardH + 6);

      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, cardW, cardH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(x, y, cardW, cardH, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(card.label.toUpperCase(), x + 4, y + 7);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 110, 253);
      doc.text(card.val, x + 4, y + 16);
    });

    // Ranking Table Title
    let currentY = 115;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Ranking de Cursos Más Solicitados', 14, currentY);

    // Table Header
    currentY += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 8, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Curso', 18, currentY + 5.5);
    doc.text('Precio', 130, currentY + 5.5);
    doc.text('Inscriptos', 160, currentY + 5.5);
    doc.text('Rating', 185, currentY + 5.5);

    currentY += 8;

    if (metrics.topDemandedCourses && metrics.topDemandedCourses.length > 0) {
      metrics.topDemandedCourses.forEach((c: any) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);

        // Truncate name if too long
        const nameText = c.name.length > 55 ? c.name.substring(0, 52) + '...' : c.name;
        doc.text(nameText, 18, currentY + 6);
        doc.text(`$${c.price}`, 130, currentY + 6);
        doc.text(`${c.enrolledCount}`, 160, currentY + 6);
        doc.text(`${c.rating} *`, 185, currentY + 6);

        currentY += 9;
        doc.setDrawColor(241, 245, 249);
        doc.line(14, currentY, 196, currentY);
      });
    }

    doc.save(`Informe_Metricas_AcademiaTech_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  /**
   * Genera el Plan de Estudios Oficial en formato PDF con temario completo, profesor a cargo y correo de consultas.
   */
  generateSyllabusPdf(product: Product, studentName?: string): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // Navy Dark (#0f172a)
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Accent line below header
    doc.setFillColor(99, 102, 241); // Indigo (#6366f1)
    doc.rect(0, 30, pageWidth, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMIA TECH - PLAN DE ESTUDIOS OFICIAL', 14, 17);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('PROGRAMA ACADÉMICO Y GUÍA CURRICULAR DE CAPACITACIÓN', 14, 25);

    let currentY = 41;

    // Course Title Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    const courseTitleLines = doc.splitTextToSize(product.name, 180);
    doc.text(courseTitleLines, 14, currentY);
    currentY += courseTitleLines.length * 6 + 1;

    // Course Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const descText = product.description || 'Capacitación profesional intensiva orientada a la práctica real con tecnologías de vanguardia.';
    const descLines = doc.splitTextToSize(descText, 180);
    doc.text(descLines, 14, currentY);
    currentY += descLines.length * 4.8 + 3;

    // Meta Badges Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 15, 'F');
    doc.rect(14, currentY, 182, 15, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('MODALIDAD: 100% Online en Vivo y Grabado', 18, currentY + 6);
    doc.text('CARGA HORARIA: 60 Hs Académicas', 86, currentY + 6);
    doc.text('CERTIFICACIÓN: Oficial Acreditada', 144, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Destinatario: ${studentName || 'Estudiante Matriculado'}`, 18, currentY + 11.5);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}`, 144, currentY + 11.5);

    currentY += 21;

    // Teacher & Inquiries Box (Profesor a cargo y Email para consultas)
    const teacher = this.getTeacherForCourse(product.name);
    doc.setFillColor(238, 242, 255); // Indigo light background
    doc.setDrawColor(199, 210, 254);
    doc.rect(14, currentY, 182, 30, 'F');
    doc.rect(14, currentY, 182, 30, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(67, 56, 202);
    doc.text('PROFESOR A CARGO & MENTOR ACADÉMICO:', 18, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${teacher.name} (${teacher.title})`, 18, currentY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    doc.text('Email para consultas académicas: ', 18, currentY + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(teacher.email, 72, currentY + 19);

    // Tutoría activa en renglón propio para evitar cualquier superposición
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('• Tutoría activa garantizada: respuestas a dudas técnicas y consultas en < 24 hs', 18, currentY + 25);

    currentY += 36;

    // Syllabus Modules Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(30, 41, 59);
    doc.text('PLAN DE ESTUDIOS & CONTENIDOS DETALLADOS', 14, currentY);
    currentY += 6;

    const modules = [
      {
        title: 'MÓDULO 1: Fundamentos, Entorno y Arquitectura Base',
        topics: [
          '• Configuración del entorno de desarrollo, herramientas modernas y convenciones de código.',
          '• Principios de ingeniería de software SOLID, separación de responsabilidades y Clean Code.'
        ]
      },
      {
        title: 'MÓDULO 2: Desarrollo Práctico, Integración y Lógica de Negocio',
        topics: [
          '• Implementación de servicios modulares, controladores y arquitectura orientada a dominio.',
          '• Modelado de datos, validación rigurosa de entradas y persistencia estructurada.'
        ]
      },
      {
        title: 'MÓDULO 3: Seguridad, Autenticación y Autorización',
        topics: [
          '• Mecanismos de autenticación con JWT, ciclo de vida de sesiones y protección de credenciales.',
          '• Gestión de roles (Admin / Alumno), autorización granular y prevención de vulnerabilidades.'
        ]
      },
      {
        title: 'MÓDULO 4: Pruebas, Despliegue en la Nube y Proyecto Final Integrador',
        topics: [
          '• Estrategias de testing, optimización de rendimiento y buenas prácticas para producción.',
          '• Entrega del proyecto final integrador para la obtención de la Certificación Oficial.'
        ]
      }
    ];

    modules.forEach((mod) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, currentY, 182, 19, 'F');
      doc.rect(14, currentY, 182, 19, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text(mod.title, 18, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(51, 65, 85);
      doc.text(mod.topics[0], 18, currentY + 10.5);
      doc.text(mod.topics[1], 18, currentY + 15.5);

      currentY += 22;
    });

    // Institutional Footer
    const footerY = pageHeight - 18;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Academia Tech S.A. - Certificación Oficial de Formación Técnica Profesional', 14, footerY);
    doc.text(`Consultas generales: mesa-ayuda@academiatech.com | 0810-333-TECH (8324)`, 14, footerY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('Documento Curricular Oficial (PDF)', pageWidth - 14, footerY, { align: 'right' });

    const cleanFileName = product.name.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Plan_de_Estudios_${cleanFileName}.pdf`);
  }

  private getTeacherForCourse(courseName: string): { name: string; title: string; email: string } {
    const name = courseName.toLowerCase();
    if (name.includes('fullstack') || name.includes('web')) {
      return {
        name: 'Prof. Lic. Melisa Pedrozo',
        title: 'Lead Fullstack Developer & Arquitecta Web',
        email: 'consultas.fullstack@academiatech.com'
      };
    }
    if (name.includes('typescript') || name.includes('código')) {
      return {
        name: 'Prof. Ing. Carlos Martínez',
        title: 'Especialista en TypeScript y Arquitectura Limpia',
        email: 'consultas.typescript@academiatech.com'
      };
    }
    if (name.includes('datos') || name.includes('prisma')) {
      return {
        name: 'Prof. Lic. Valeria Gómez',
        title: 'Senior Data Engineer & DBA Prisma/SQL',
        email: 'consultas.datos@academiatech.com'
      };
    }
    if (name.includes('devops') || name.includes('docker') || name.includes('kubernetes')) {
      return {
        name: 'Prof. Ing. Lucas Silva',
        title: 'Cloud Solutions Architect & DevOps Specialist',
        email: 'consultas.devops@academiatech.com'
      };
    }
    if (name.includes('inteligencia') || name.includes('ia') || name.includes('prompt')) {
      return {
        name: 'Prof. Dra. Florencia Benítez',
        title: 'Investigadora en Inteligencia Artificial',
        email: 'consultas.ia@academiatech.com'
      };
    }
    if (name.includes('seguridad') || name.includes('auth')) {
      return {
        name: 'Prof. Lic. Martín Ramos',
        title: 'Especialista en Ciberseguridad y Autenticación',
        email: 'consultas.seguridad@academiatech.com'
      };
    }
    if (name.includes('diseño') || name.includes('css') || name.includes('ui')) {
      return {
        name: 'Prof. Lic. Sofía Morales',
        title: 'Diseñadora UI/UX y Especialista Frontend',
        email: 'consultas.ux@academiatech.com'
      };
    }
    return {
      name: 'Prof. Lic. Melisa Pedrozo',
      title: 'Coordinadora Académica y Docente Titular',
      email: 'consultas.docentes@academiatech.com'
    };
  }
}
