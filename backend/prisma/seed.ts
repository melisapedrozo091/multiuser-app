import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos en la base de datos MySQL (multiuser_db)...');

  // 1. Asegurar usuarios base
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: { role: 'ADMIN' },
    create: {
      id: 'usr_admin',
      email: 'admin@sistema.com',
      password: 'admin123_hash',
      displayName: 'Administrador General',
      role: 'ADMIN'
    }
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@gmail.com' },
    update: { role: 'CLIENTE' },
    create: {
      id: 'usr_client',
      email: 'cliente@gmail.com',
      password: 'cliente123_hash',
      displayName: 'Carlos López',
      role: 'CLIENTE'
    }
  });

  const melisaUser = await prisma.user.upsert({
    where: { email: 'melisapedrozo091@gmail.com' },
    update: {},
    create: {
      id: 'usr_melisa',
      email: 'melisapedrozo091@gmail.com',
      password: 'password123',
      displayName: 'Melisa Pedrozo',
      role: 'ADMIN'
    }
  });

  // 2. Cargar 8 Cursos con Temarios Completos (Syllabus)
  const coursesData = [
    {
      id: 1,
      name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      description: 'Aprende arquitectura modular, componentes standalone, routing, signals, REST APIs con Express y persistencia con bases de datos MySQL.',
      price: 199.99,
      stock: 45,
      syllabus: 'Módulo 1: Fundamentos de TypeScript y Angular Standalone. Módulo 2: Servicios, Inyección de Dependencias y RxJS. Módulo 3: Backend con Express y Node.js. Módulo 4: Persistencia con MySQL y Prisma ORM. Módulo 5: Autenticación JWT y Roles de Usuario. Módulo 6: Proyecto Final y Despliegue en Producción.'
    },
    {
      id: 2,
      name: 'Masterclass en TypeScript & Arquitectura Limpia',
      description: 'Domina patrones de diseño, principios SOLID, tipos avanzados, genéricos, decoradores y pruebas unitarias con Jest.',
      price: 149.50,
      stock: 30,
      syllabus: 'Módulo 1: Sistema de tipos avanzado (Utility Types, Generics, Conditional Types). Módulo 2: Principios SOLID aplicados a proyectos frontend y backend. Módulo 3: Clean Architecture y Patrón Repositorio. Módulo 4: Manejo de Errores y Validaciones. Módulo 5: Testing automatizado con Jest.'
    },
    {
      id: 3,
      name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      description: 'Optimización de consultas SQL, modelado entidad-relación, migraciones, transacciones ACID y pooling de conexiones de alta concurrencia.',
      price: 179.00,
      stock: 35,
      syllabus: 'Módulo 1: Modelado relacional e integridad referencial. Módulo 2: Prisma ORM: Schemas, Migraciones y Prisma Studio. Módulo 3: Consultas avanzadas, Joins y Filtros complejos. Módulo 4: Transacciones ACID y Concurrencia. Módulo 5: Indexación, Planes de Ejecución y Performance Tuning.'
    },
    {
      id: 4,
      name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      description: 'Contenedores desde cero, orquestación con Kubernetes, despliegue continuo con GitHub Actions y monitoreo de infraestructura.',
      price: 249.00,
      stock: 20,
      syllabus: 'Módulo 1: Docker: Dockerfile, Docker Compose y Networking. Módulo 2: Kubernetes: Pods, Services, Ingress y Deployments. Módulo 3: CI/CD con GitHub Actions y automatización. Módulo 4: Monitoreo, Logs y Métricas de Rendimiento. Módulo 5: Seguridad en Contenedores y Buenas Prácticas.'
    },
    {
      id: 5,
      name: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      description: 'Integración de LLMs, APIs de OpenAI y Gemini, fine-tuning básico, automatización de código y flujos asistidos con IA.',
      price: 219.00,
      stock: 50,
      syllabus: 'Módulo 1: Fundamentos de LLMs y Prompt Engineering. Módulo 2: Integración de APIs de IA en Node.js y Angular. Módulo 3: Function Calling y Embeddings. Módulo 4: Creación de Asistentes Autónomos. Módulo 5: Ética, Costos y Escalabilidad de IA.'
    },
    {
      id: 6,
      name: 'Seguridad Web & Autenticación con Firebase y JWT',
      description: 'Implementación de roles, permisos, OAuth2, verificación de tokens y buenas prácticas de ciberseguridad.',
      price: 129.99,
      stock: 25,
      syllabus: 'Módulo 1: Ciberseguridad Web: OWASP Top 10 y mitigación. Módulo 2: JWT (JSON Web Tokens): Firma, Expiración y Refresco. Módulo 3: Firebase Authentication y SDKs de Administración. Módulo 4: Middleware de Autorización y Control de Acceso basado en Roles (RBAC). Módulo 5: Cifrado y Almacenamiento seguro.'
    },
    {
      id: 7,
      name: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      description: 'Crea interfaces responsivas, diseño dinámico, animaciones fluidas y experiencia de usuario de alto nivel.',
      price: 99.99,
      stock: 60,
      syllabus: 'Módulo 1: Principios de UX y jerarquía visual. Módulo 2: CSS Grid, Flexbox y Maquetación Avanzada. Módulo 3: Design Tokens, Variables CSS y Temas Oscuros/Claros. Módulo 4: Micro-interacciones y Animaciones Fluidas. Módulo 5: Accesibilidad Web (WCAG).'
    },
    {
      id: 8,
      name: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      description: 'Sesión personalizada de asesoramiento en código, revisión de arquitectura y solución de dudas.',
      price: 120.00,
      stock: 15,
      syllabus: 'Sesión 1: Diagnóstico de requerimientos y revisión técnica. Sesión 2: Análisis de Arquitectura y Refactorización. Sesión 3: Pruebas y Optimización de Rendimiento. Sesión 4: Hoja de ruta profesional y recomendaciones de despliegue.'
    }
  ];

  for (const c of coursesData) {
    await prisma.product.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        description: c.description,
        syllabus: c.syllabus,
        price: c.price,
        stock: c.stock
      },
      create: {
        id: c.id,
        name: c.name,
        description: c.description,
        syllabus: c.syllabus,
        price: c.price,
        stock: c.stock,
        ownerId: adminUser.id
      }
    });
  }

  // 3. Cargar 8 Inscripciones (Enrollments) con Estados Variados
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  
  const enrollmentsData = [
    {
      id: 'INS-2026-001',
      code: 'INS-2026-001',
      userId: clientUser.id,
      userEmail: clientUser.email,
      userName: clientUser.displayName || 'Carlos López',
      courseId: 1,
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      price: 199.99,
      currency: 'USD',
      date: '10/10/2026',
      createdAt: new Date(now.getTime() - 25 * day),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Excelente contenido, los proyectos prácticos me permitieron conseguir mi primer empleo como fullstack.',
      deletedFromUi: false
    },
    {
      id: 'INS-2026-002',
      code: 'INS-2026-002',
      userId: clientUser.id,
      userEmail: clientUser.email,
      userName: clientUser.displayName || 'Carlos López',
      courseId: 2,
      courseName: 'Masterclass en TypeScript & Arquitectura Limpia',
      price: 149.50,
      currency: 'ARS',
      date: '12/10/2026',
      createdAt: new Date(now.getTime() - 20 * day),
      status: 'EN_CURSO',
      paymentMethod: 'Mercado Pago (Transferencia)',
      rating: 5,
      reviewComment: 'Muy buena metodología y explicación de principios SOLID.',
      deletedFromUi: false
    },
    {
      id: 'INS-2026-003',
      code: 'INS-2026-003',
      userId: 'usr_maria',
      userEmail: 'maria.dev@outlook.com',
      userName: 'María Rodríguez',
      courseId: 3,
      courseName: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      price: 179.00,
      currency: 'USD',
      date: '14/10/2026',
      createdAt: new Date(now.getTime() - 15 * day),
      status: 'EN_CURSO',
      paymentMethod: 'Tarjeta de Débito (Mastercard)',
      rating: 4,
      reviewComment: 'Excelente explicación de migraciones y optimización de consultas SQL.',
      deletedFromUi: false
    },
    {
      id: 'INS-2026-004',
      code: 'INS-2026-004',
      userId: 'usr_lucas',
      userEmail: 'lucas.code@gmail.com',
      userName: 'Lucas Ferreyra',
      courseId: 4,
      courseName: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      price: 249.00,
      currency: 'USD',
      date: '15/10/2026',
      createdAt: new Date(now.getTime() - 12 * day),
      pausedAt: new Date(now.getTime() - 5 * day),
      status: 'PAUSADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: null,
      reviewComment: null,
      deletedFromUi: false
    },
    {
      id: 'INS-2026-005',
      code: 'INS-2026-005',
      userId: clientUser.id,
      userEmail: clientUser.email,
      userName: clientUser.displayName || 'Carlos López',
      courseId: 5,
      courseName: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      price: 219.00,
      currency: 'USD',
      date: '17/10/2026',
      createdAt: new Date(now.getTime() - 8 * day),
      status: 'INSCRIPTO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: null,
      reviewComment: null,
      deletedFromUi: false
    },
    {
      id: 'INS-2026-006',
      code: 'INS-2026-006',
      userId: 'usr_sofia',
      userEmail: 'sofia.tech@gmail.com',
      userName: 'Sofía Martínez',
      courseId: 6,
      courseName: 'Seguridad Web & Autenticación con Firebase y JWT',
      price: 129.99,
      currency: 'USD',
      date: '18/10/2026',
      createdAt: new Date(now.getTime() - 6 * day),
      status: 'ANULADO',
      refundReason: 'Superposición de horarios laborales con las clases en vivo',
      paymentMethod: 'Tarjeta de Débito (Visa)',
      rating: null,
      reviewComment: null,
      deletedFromUi: false
    },
    {
      id: 'INS-2026-007',
      code: 'INS-2026-007',
      userId: 'usr_juan',
      userEmail: 'juan.frontend@hotmail.com',
      userName: 'Juan Ignacio Díaz',
      courseId: 7,
      courseName: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      price: 99.99,
      currency: 'ARS',
      date: '19/10/2026',
      createdAt: new Date(now.getTime() - 3 * day),
      status: 'INSCRIPTO',
      paymentMethod: 'Mercado Pago (Alias)',
      rating: null,
      reviewComment: null,
      deletedFromUi: false
    },
    {
      id: 'INS-2026-008',
      code: 'INS-2026-008',
      userId: clientUser.id,
      userEmail: clientUser.email,
      userName: clientUser.displayName || 'Carlos López',
      courseId: 8,
      courseName: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      price: 120.00,
      currency: 'USD',
      date: '20/10/2026',
      createdAt: new Date(now.getTime() - 2 * day),
      pausedAt: new Date(now.getTime() - 1 * day),
      status: 'PAUSADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Excelente asesoría en arquitectura de bases de datos.',
      deletedFromUi: false
    }
  ];

  for (const e of enrollmentsData) {
    await prisma.enrollment.upsert({
      where: { code: e.code },
      update: {
        status: e.status,
        pausedAt: e.pausedAt || null,
        refundReason: e.refundReason || null,
        rating: e.rating,
        reviewComment: e.reviewComment,
        deletedFromUi: e.deletedFromUi
      },
      create: e
    });
  }

  // 4. Cargar Facturas en la Base de Datos
  const invoicesData = [
    {
      invoiceNumber: 'FAC-2026-001',
      enrollmentId: 'INS-2026-001',
      userId: clientUser.id,
      userEmail: clientUser.email,
      clientName: clientUser.displayName || 'Carlos López',
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      amount: 199.99,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      date: '10/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-002',
      enrollmentId: 'INS-2026-002',
      userId: clientUser.id,
      userEmail: clientUser.email,
      clientName: clientUser.displayName || 'Carlos López',
      courseName: 'Masterclass en TypeScript & Arquitectura Limpia',
      amount: 149.50,
      currency: 'ARS',
      paymentMethod: 'Mercado Pago (Transferencia)',
      date: '12/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-003',
      enrollmentId: 'INS-2026-003',
      userId: 'usr_maria',
      userEmail: 'maria.dev@outlook.com',
      clientName: 'María Rodríguez',
      courseName: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      amount: 179.00,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Débito (Mastercard)',
      date: '14/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-004',
      enrollmentId: 'INS-2026-004',
      userId: 'usr_lucas',
      userEmail: 'lucas.code@gmail.com',
      clientName: 'Lucas Ferreyra',
      courseName: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      amount: 249.00,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      date: '15/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-005',
      enrollmentId: 'INS-2026-005',
      userId: clientUser.id,
      userEmail: clientUser.email,
      clientName: clientUser.displayName || 'Carlos López',
      courseName: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      amount: 219.00,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      date: '17/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-006',
      enrollmentId: 'INS-2026-006',
      userId: 'usr_sofia',
      userEmail: 'sofia.tech@gmail.com',
      clientName: 'Sofía Martínez',
      courseName: 'Seguridad Web & Autenticación con Firebase y JWT',
      amount: 129.99,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Débito (Visa)',
      date: '18/10/2026',
      status: 'REEMBOLSADO'
    },
    {
      invoiceNumber: 'FAC-2026-007',
      enrollmentId: 'INS-2026-007',
      userId: 'usr_juan',
      userEmail: 'juan.frontend@hotmail.com',
      clientName: 'Juan Ignacio Díaz',
      courseName: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      amount: 99.99,
      currency: 'ARS',
      paymentMethod: 'Mercado Pago (Alias)',
      date: '19/10/2026',
      status: 'PAGADO'
    },
    {
      invoiceNumber: 'FAC-2026-008',
      enrollmentId: 'INS-2026-008',
      userId: clientUser.id,
      userEmail: clientUser.email,
      clientName: clientUser.displayName || 'Carlos López',
      courseName: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      amount: 120.00,
      currency: 'USD',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      date: '20/10/2026',
      status: 'PAGADO'
    }
  ];

  for (const inv of invoicesData) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: {
        amount: inv.amount,
        status: inv.status
      },
      create: inv
    });
  }

  // 5. Cargar Certificados Oficiales en la Base de Datos
  const certificatesData = [
    {
      certificateCode: 'CERT-FULLSTACK-2026-001',
      enrollmentId: 'INS-2026-001',
      userId: clientUser.id,
      userEmail: clientUser.email,
      studentName: clientUser.displayName || 'Carlos López',
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      issueDate: '10 de Octubre de 2026',
      grade: 'Sobresaliente (10/10)',
      status: 'EMITIDO'
    },
    {
      certificateCode: 'CERT-DEV-2026-092',
      enrollmentId: 'INS-2026-008',
      userId: clientUser.id,
      userEmail: clientUser.email,
      studentName: clientUser.displayName || 'Carlos López',
      courseName: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      issueDate: '20 de Octubre de 2026',
      grade: 'Distinguido (9.5/10)',
      status: 'EMITIDO'
    }
  ];

  for (const cert of certificatesData) {
    await prisma.certificate.upsert({
      where: { certificateCode: cert.certificateCode },
      update: {
        grade: cert.grade,
        status: cert.status
      },
      create: cert
    });
  }

  console.log('✅ Base de datos poblada exitosamente con:');
  console.log(`- ${coursesData.length} Cursos con Temarios Oficiales`);
  console.log(`- ${enrollmentsData.length} Inscripciones activas, pausadas, finalizadas y canceladas`);
  console.log(`- ${invoicesData.length} Facturas y comprobantes`);
  console.log(`- ${certificatesData.length} Certificados oficiales`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
