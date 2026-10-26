import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando base de datos MySQL con clientes, cursos, inscripciones y reseñas reales...');

  // 1. Usuarios Administradores y Clientes
  const passwordHash = await bcrypt.hash('cliente123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: { role: 'ADMIN', displayName: 'Administrador General' },
    create: {
      id: 'usr_admin',
      email: 'admin@sistema.com',
      password: adminHash,
      displayName: 'Administrador General',
      role: 'ADMIN'
    }
  });

  const melisa = await prisma.user.upsert({
    where: { email: 'melisapedrozo091@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      id: 'usr_melisa',
      email: 'melisapedrozo091@gmail.com',
      password: adminHash,
      displayName: 'Melisa Pedrozo',
      role: 'ADMIN'
    }
  });

  const clientsData = [
    { id: 'usr_client_01', email: 'cliente@gmail.com', displayName: 'Carlos López' },
    { id: 'usr_client_02', email: 'maria.rodriguez@outlook.com', displayName: 'María Rodríguez' },
    { id: 'usr_client_03', email: 'lucas.ferreyra@gmail.com', displayName: 'Lucas Ferreyra' },
    { id: 'usr_client_04', email: 'sofia.martinez@gmail.com', displayName: 'Sofía Martínez' },
    { id: 'usr_client_05', email: 'juan.diaz@hotmail.com', displayName: 'Juan Ignacio Díaz' },
    { id: 'usr_client_06', email: 'valentina.gomez@gmail.com', displayName: 'Valentina Gómez' },
    { id: 'usr_client_07', email: 'matias.romero@tech.io', displayName: 'Matías Romero' },
    { id: 'usr_client_08', email: 'camila.torres@empresa.com', displayName: 'Camila Torres' },
    { id: 'usr_client_09', email: 'esteban.navarro@gmail.com', displayName: 'Esteban Navarro' },
    { id: 'usr_client_10', email: 'lucia.benitez@yahoo.com', displayName: 'Lucía Benítez' },
    { id: 'usr_client_11', email: 'agustin.perez@coder.com', displayName: 'Agustín Pérez' },
    { id: 'usr_client_12', email: 'florencia.silva@gmail.com', displayName: 'Florencia Silva' }
  ];

  for (const c of clientsData) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: { displayName: c.displayName, role: 'CLIENTE' },
      create: {
        id: c.id,
        email: c.email,
        displayName: c.displayName,
        password: passwordHash,
        role: 'CLIENTE'
      }
    });
  }
  console.log(`✅ ${clientsData.length} Clientes registrados en MySQL.`);

  // 2. Cursos completos con temarios oficiales
  const coursesData = [
    {
      id: 1,
      name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      description: 'Aprende arquitectura modular, componentes standalone, routing, signals, REST APIs con Express y persistencia con MySQL.',
      price: 199.99,
      stock: 50,
      syllabus: 'Módulo 1: Fundamentos de TypeScript y Angular Standalone. Módulo 2: Servicios, Inyección de Dependencias y RxJS. Módulo 3: Backend con Express y Node.js. Módulo 4: Persistencia con MySQL y Prisma ORM. Módulo 5: Autenticación JWT y Roles de Usuario. Módulo 6: Proyecto Final y Despliegue en Producción.'
    },
    {
      id: 2,
      name: 'Masterclass en TypeScript & Arquitectura Limpia',
      description: 'Domina patrones de diseño, principios SOLID, tipos avanzados, genéricos, decoradores y pruebas unitarias con Jest.',
      price: 149.50,
      stock: 40,
      syllabus: 'Módulo 1: Sistema de tipos avanzado (Utility Types, Generics). Módulo 2: Principios SOLID aplicados a proyectos frontend y backend. Módulo 3: Clean Architecture y Patrón Repositorio. Módulo 4: Manejo de Errores y Validaciones. Módulo 5: Testing automatizado con Jest.'
    },
    {
      id: 3,
      name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      description: 'Optimización de consultas SQL, modelado entidad-relación, migraciones, transacciones ACID y pooling de conexiones de alta concurrencia.',
      price: 179.00,
      stock: 45,
      syllabus: 'Módulo 1: Modelado relacional e integridad referencial. Módulo 2: Prisma ORM: Schemas, Migraciones y Prisma Studio. Módulo 3: Consultas avanzadas, Joins y Filtros complejos. Módulo 4: Transacciones ACID y Concurrencia. Módulo 5: Indexación, Planes de Ejecución y Performance Tuning.'
    },
    {
      id: 4,
      name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      description: 'Contenedores desde cero, orquestación con Kubernetes, despliegue continuo con GitHub Actions y monitoreo de infraestructura.',
      price: 249.00,
      stock: 35,
      syllabus: 'Módulo 1: Docker: Dockerfile, Docker Compose y Networking. Módulo 2: Kubernetes: Pods, Services, Ingress y Deployments. Módulo 3: CI/CD con GitHub Actions y automatización. Módulo 4: Monitoreo, Logs y Métricas de Rendimiento. Módulo 5: Seguridad en Contenedores.'
    },
    {
      id: 5,
      name: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      description: 'Integración de LLMs, APIs de OpenAI y Gemini, fine-tuning básico, automatización de código y flujos asistidos con IA.',
      price: 219.00,
      stock: 60,
      syllabus: 'Módulo 1: Fundamentos de LLMs y Prompt Engineering. Módulo 2: Integración de APIs de IA en Node.js y Angular. Módulo 3: Function Calling y Embeddings. Módulo 4: Creación de Asistentes Autónomos. Módulo 5: Ética, Costos y Escalabilidad.'
    },
    {
      id: 6,
      name: 'Seguridad Web & Autenticación con Firebase y JWT',
      description: 'Implementación de roles, permisos, OAuth2, verificación de tokens y buenas prácticas de ciberseguridad.',
      price: 129.99,
      stock: 30,
      syllabus: 'Módulo 1: Ciberseguridad Web: OWASP Top 10 y mitigación. Módulo 2: JWT (JSON Web Tokens): Firma, Expiración y Refresco. Módulo 3: Firebase Authentication y SDKs de Administración. Módulo 4: Middleware de Autorización y Control de Acceso basado en Roles (RBAC). Módulo 5: Cifrado y Almacenamiento seguro.'
    },
    {
      id: 7,
      name: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      description: 'Crea interfaces responsivas, diseño dinámico, animaciones fluidas y experiencia de usuario de alto nivel.',
      price: 99.99,
      stock: 70,
      syllabus: 'Módulo 1: Principios de UX y jerarquía visual. Módulo 2: CSS Grid, Flexbox y Maquetación Avanzada. Módulo 3: Design Tokens, Variables CSS y Temas Oscuros/Claros. Módulo 4: Micro-interacciones y Animaciones Fluidas. Módulo 5: Accesibilidad Web (WCAG).'
    },
    {
      id: 8,
      name: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      description: 'Sesión personalizada de asesoramiento en código, revisión de arquitectura y solución de dudas técnicas complejas.',
      price: 120.00,
      stock: 25,
      syllabus: 'Sesión 1: Diagnóstico de requerimientos y auditoría de código. Sesión 2: Análisis de Arquitectura y Refactorización. Sesión 3: Pruebas y Optimización de Rendimiento. Sesión 4: Hoja de ruta profesional y recomendaciones de despliegue.'
    },
    {
      id: 9,
      name: 'Arquitectura Cloud en Google Cloud Platform (GCP) & Microservicios',
      description: 'Diseño de sistemas distribuidos, Cloud Run, Cloud Functions, BigQuery y balanceo de carga global resiliente.',
      price: 229.00,
      stock: 40,
      syllabus: 'Módulo 1: Fundamentos de Cloud Computing y GCP. Módulo 2: Contenedores con Cloud Run y GKE. Módulo 3: Arquitectura Serverless y Event-driven con Cloud Pub/Sub. Módulo 4: Gestión de datos con Cloud SQL y BigQuery. Módulo 5: Redes Virtuales (VPC), IAM y Políticas de Seguridad Cloud.'
    },
    {
      id: 10,
      name: 'Desarrollo de Apps Móviles Multiplataforma con Flutter & Dart',
      description: 'Construye aplicaciones nativas para iOS y Android desde un único código base con alto rendimiento visual a 60 FPS.',
      price: 189.50,
      stock: 45,
      syllabus: 'Módulo 1: Lenguaje Dart moderno y POO. Módulo 2: Widgets de Flutter, Layouts y Tematización. Módulo 3: Gestión de Estado (Provider, Riverpod, BLoC). Módulo 4: Consumo de APIs REST y almacenamiento local con Hive. Módulo 5: Publicación en Google Play Store y Apple App Store.'
    },
    {
      id: 11,
      name: 'Machine Learning & Análisis de Datos con Python y Pandas',
      description: 'Exploración de datasets, regresión, clasificación, Scikit-Learn y visualización de datos con Matplotlib y Seaborn.',
      price: 209.00,
      stock: 50,
      syllabus: 'Módulo 1: Python orientado a Data Science (NumPy & Pandas). Módulo 2: Limpieza y preprocesamiento de datos masivos. Módulo 3: Algoritmos de Clasificación y Regresión con Scikit-Learn. Módulo 4: Evaluación de Modelos y Matrices de Confusión. Módulo 5: Despliegue de Modelos como APIs con FastAPI.'
    },
    {
      id: 12,
      name: 'Ciberseguridad Ofensiva, Ethical Hacking & Pentesting',
      description: 'Técnicas de pentesting ético, análisis de vulnerabilidades, escaneo de puertos, pruebas de penetración y reporte forense.',
      price: 259.00,
      stock: 30,
      syllabus: 'Módulo 1: Metodologías de Pentesting (PTES & OSSTMM). Módulo 2: Reconocimiento pasivo y activo con Nmap y Wireshark. Módulo 3: Explotación web (SQLi, XSS, CSRF, RCE). Módulo 4: Escalada de privilegios en Linux y Windows. Módulo 5: Confección de Informes de Auditoría de Seguridad.'
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
        ownerId: admin.id
      }
    });
  }
  console.log(`✅ ${coursesData.length} Cursos oficiales activos en MySQL.`);

  // 3. Inscripciones distribuidas a lo largo de los últimos meses (Mayo, Junio, Julio, Agosto, Septiembre, Octubre 2026)
  // para que el gráfico de barras por mes muestre una progresión realista y clara.
  const enrollmentsData = [
    // Octubre 2026 (Actual)
    {
      code: 'INS-2026-001',
      userId: 'usr_client_01',
      userEmail: 'cliente@gmail.com',
      userName: 'Carlos López',
      courseId: 1,
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      price: 199.99,
      currency: 'USD',
      date: '20/10/2026',
      createdAt: new Date('2026-10-20T14:30:00Z'),
      status: 'EN_CURSO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Excelente curso, muy bien explicados los temas de Angular y Node.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-002',
      userId: 'usr_client_02',
      userEmail: 'maria.rodriguez@outlook.com',
      userName: 'María Rodríguez',
      courseId: 3,
      courseName: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      price: 179.00,
      currency: 'USD',
      date: '18/10/2026',
      createdAt: new Date('2026-10-18T10:15:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Débito (Mastercard)',
      rating: 5,
      reviewComment: 'Increíble explicación de migraciones, índices y optimización de queries SQL.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-003',
      userId: 'usr_client_03',
      userEmail: 'lucas.ferreyra@gmail.com',
      userName: 'Lucas Ferreyra',
      courseId: 4,
      courseName: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      price: 249.00,
      currency: 'USD',
      date: '15/10/2026',
      createdAt: new Date('2026-10-15T09:00:00Z'),
      status: 'EN_CURSO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Docker y Kubernetes explicados de forma práctica sin vueltas.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-004',
      userId: 'usr_client_06',
      userEmail: 'valentina.gomez@gmail.com',
      userName: 'Valentina Gómez',
      courseId: 5,
      courseName: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
      price: 245000,
      currency: 'ARS',
      date: '12/10/2026',
      createdAt: new Date('2026-10-12T16:20:00Z'),
      status: 'INSCRIPTO',
      paymentMethod: 'Mercado Pago (Transferencia)',
      rating: 5,
      reviewComment: 'Muy buenas prácticas para interactuar con modelos de IA.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-005',
      userId: 'usr_client_07',
      userEmail: 'matias.romero@tech.io',
      userName: 'Matías Romero',
      courseId: 9,
      courseName: 'Arquitectura Cloud en Google Cloud Platform (GCP) & Microservicios',
      price: 229.00,
      currency: 'USD',
      date: '08/10/2026',
      createdAt: new Date('2026-10-08T11:45:00Z'),
      status: 'EN_CURSO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Dominar Cloud Run y arquitectura serverless me sirvió un montón en mi trabajo.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-006',
      userId: 'usr_client_11',
      userEmail: 'agustin.perez@coder.com',
      userName: 'Agustín Pérez',
      courseId: 12,
      courseName: 'Ciberseguridad Ofensiva, Ethical Hacking & Pentesting',
      price: 259.00,
      currency: 'USD',
      date: '05/10/2026',
      createdAt: new Date('2026-10-05T18:00:00Z'),
      status: 'EN_CURSO',
      paymentMethod: 'Transferencia Bancaria',
      rating: 5,
      reviewComment: 'Excelente nivel técnico y laboratorios prácticos de pentesting.',
      deletedFromUi: false
    },

    // Septiembre 2026
    {
      code: 'INS-2026-007',
      userId: 'usr_client_01',
      userEmail: 'cliente@gmail.com',
      userName: 'Carlos López',
      courseId: 2,
      courseName: 'Masterclass en TypeScript & Arquitectura Limpia',
      price: 165000,
      currency: 'ARS',
      date: '28/09/2026',
      createdAt: new Date('2026-09-28T10:00:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Mercado Pago (Transferencia)',
      rating: 5,
      reviewComment: 'Clarísimo para entender patrones de diseño y principios SOLID.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-008',
      userId: 'usr_client_05',
      userEmail: 'juan.diaz@hotmail.com',
      userName: 'Juan Ignacio Díaz',
      courseId: 7,
      courseName: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      price: 110000,
      currency: 'ARS',
      date: '20/09/2026',
      createdAt: new Date('2026-09-20T15:30:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Mercado Pago (Alias)',
      rating: 4,
      reviewComment: 'Muy dinámico y útil para devs que nos cuesta el diseño.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-009',
      userId: 'usr_client_08',
      userEmail: 'camila.torres@empresa.com',
      userName: 'Camila Torres',
      courseId: 10,
      courseName: 'Desarrollo de Apps Móviles Multiplataforma con Flutter & Dart',
      price: 189.50,
      currency: 'USD',
      date: '14/09/2026',
      createdAt: new Date('2026-09-14T12:00:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Mastercard)',
      rating: 5,
      reviewComment: 'Flutter es genial y el curso te lleva paso a paso desde cero.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-010',
      userId: 'usr_client_10',
      userEmail: 'lucia.benitez@yahoo.com',
      userName: 'Lucía Benítez',
      courseId: 1,
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      price: 199.99,
      currency: 'USD',
      date: '05/09/2026',
      createdAt: new Date('2026-09-05T09:30:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Débito (Visa)',
      rating: 5,
      reviewComment: 'Lo recomiendo al 100%. Los proyectos del temario son reales.',
      deletedFromUi: false
    },

    // Agosto 2026
    {
      code: 'INS-2026-011',
      userId: 'usr_client_04',
      userEmail: 'sofia.martinez@gmail.com',
      userName: 'Sofía Martínez',
      courseId: 6,
      courseName: 'Seguridad Web & Autenticación con Firebase y JWT',
      price: 129.99,
      currency: 'USD',
      date: '25/08/2026',
      createdAt: new Date('2026-08-25T14:00:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Débito (Visa)',
      rating: 4,
      reviewComment: 'Buen contenido de autenticación y autorización segura.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-012',
      userId: 'usr_client_09',
      userEmail: 'esteban.navarro@gmail.com',
      userName: 'Esteban Navarro',
      courseId: 11,
      courseName: 'Machine Learning & Análisis de Datos con Python y Pandas',
      price: 209.00,
      currency: 'USD',
      date: '18/08/2026',
      createdAt: new Date('2026-08-18T16:45:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Gran nivel pedagógico en machine learning aplicado.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-013',
      userId: 'usr_client_02',
      userEmail: 'maria.rodriguez@outlook.com',
      userName: 'María Rodríguez',
      courseId: 4,
      courseName: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
      price: 249.00,
      currency: 'USD',
      date: '10/08/2026',
      createdAt: new Date('2026-08-10T11:15:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Los laboratorios de CI/CD con GitHub Actions están impecables.',
      deletedFromUi: false
    },

    // Julio 2026
    {
      code: 'INS-2026-014',
      userId: 'usr_client_12',
      userEmail: 'florencia.silva@gmail.com',
      userName: 'Florencia Silva',
      courseId: 1,
      courseName: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
      price: 199.99,
      currency: 'USD',
      date: '22/07/2026',
      createdAt: new Date('2026-07-22T10:00:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Mastercard)',
      rating: 5,
      reviewComment: 'El mejor curso para arrancar en frontend y backend moderno.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-015',
      userId: 'usr_client_03',
      userEmail: 'lucas.ferreyra@gmail.com',
      userName: 'Lucas Ferreyra',
      courseId: 2,
      courseName: 'Masterclass en TypeScript & Arquitectura Limpia',
      price: 165000,
      currency: 'ARS',
      date: '15/07/2026',
      createdAt: new Date('2026-07-15T15:20:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Mercado Pago (Transferencia)',
      rating: 4,
      reviewComment: 'Muy buenos ejercicios prácticos con TypeScript avanzado.',
      deletedFromUi: false
    },

    // Junio 2026
    {
      code: 'INS-2026-016',
      userId: 'usr_client_07',
      userEmail: 'matias.romero@tech.io',
      userName: 'Matías Romero',
      courseId: 3,
      courseName: 'Curso Avanzado de Bases de Datos & Prisma ORM',
      price: 179.00,
      currency: 'USD',
      date: '19/06/2026',
      createdAt: new Date('2026-06-19T13:40:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Débito (Visa)',
      rating: 5,
      reviewComment: 'Prisma y MySQL con relaciones complejas muy bien explicado.',
      deletedFromUi: false
    },
    {
      code: 'INS-2026-017',
      userId: 'usr_client_01',
      userEmail: 'cliente@gmail.com',
      userName: 'Carlos López',
      courseId: 8,
      courseName: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
      price: 120.00,
      currency: 'USD',
      date: '10/06/2026',
      createdAt: new Date('2026-06-10T17:00:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Tarjeta de Crédito (Visa)',
      rating: 5,
      reviewComment: 'Excelente asesoría para ordenar la arquitectura de mi proyecto.',
      deletedFromUi: false
    },

    // Mayo 2026
    {
      code: 'INS-2026-018',
      userId: 'usr_client_06',
      userEmail: 'valentina.gomez@gmail.com',
      userName: 'Valentina Gómez',
      courseId: 7,
      courseName: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
      price: 110000,
      currency: 'ARS',
      date: '24/05/2026',
      createdAt: new Date('2026-05-24T11:10:00Z'),
      status: 'FINALIZADO',
      paymentMethod: 'Mercado Pago (Transferencia)',
      rating: 5,
      reviewComment: 'Aprendí a maquetar profesionalmente con Flexbox y CSS Grid.',
      deletedFromUi: false
    }
  ];

  for (const e of enrollmentsData) {
    await prisma.enrollment.upsert({
      where: { code: e.code },
      update: {
        userId: e.userId,
        userEmail: e.userEmail,
        userName: e.userName,
        courseId: e.courseId,
        courseName: e.courseName,
        price: e.price,
        currency: e.currency,
        date: e.date,
        createdAt: e.createdAt,
        status: e.status,
        paymentMethod: e.paymentMethod,
        rating: e.rating,
        reviewComment: e.reviewComment,
        deletedFromUi: e.deletedFromUi
      },
      create: e
    });
  }
  console.log(`✅ ${enrollmentsData.length} Inscripciones históricas y activas registradas en MySQL.`);

  // 4. Poblar reseñas oficiales en la tabla CourseReview vinculadas a cursos y usuarios
  // Limpiamos y repoblamos para asegurar total congruencia
  await prisma.courseReview.deleteMany({});

  const reviewsToInsert = enrollmentsData
    .filter(e => e.rating && e.reviewComment)
    .map(e => ({
      courseId: e.courseId,
      courseName: e.courseName,
      userId: e.userId,
      userEmail: e.userEmail,
      userName: e.userName,
      rating: e.rating!,
      comment: e.reviewComment!,
      createdAt: e.createdAt
    }));

  for (const r of reviewsToInsert) {
    await prisma.courseReview.create({
      data: r
    });
  }
  console.log(`✅ ${reviewsToInsert.length} Reseñas reales registradas en tabla CourseReview.`);

  // 5. Facturas sincronizadas
  for (const e of enrollmentsData) {
    const invNum = `FAC-2026-${e.code.replace('INS-2026-', '')}`;
    await prisma.invoice.upsert({
      where: { invoiceNumber: invNum },
      update: {
        amount: e.price,
        status: 'PAGADO'
      },
      create: {
        invoiceNumber: invNum,
        enrollmentId: e.code,
        userId: e.userId,
        userEmail: e.userEmail,
        clientName: e.userName,
        courseName: e.courseName,
        amount: e.price,
        currency: e.currency,
        paymentMethod: e.paymentMethod,
        date: e.date,
        status: 'PAGADO',
        createdAt: e.createdAt
      }
    });
  }
  console.log(`✅ ${enrollmentsData.length} Facturas sincronizadas con inscripciones.`);

  // 6. Mensajes de foro
  await prisma.chatMessage.deleteMany({});
  const forumMessages = [
    { senderUid: 'usr_client_01', senderName: 'Carlos López', message: '¡Hola a todos! ¿Alguien que esté cursando el módulo de Angular Signals me da una mano con un computed?' },
    { senderUid: 'usr_admin', senderName: 'Administrador General', message: '¡Hola Carlos! Los computed se actualizan automáticamente cuando cambian sus dependencias reactivas. Podés consultar el video del Módulo 2.' },
    { senderUid: 'usr_client_02', senderName: 'María Rodríguez', message: '¿Recomiendan hacer primero el de TypeScript o arrancar directo con Angular?' },
    { senderUid: 'usr_client_03', senderName: 'Lucas Ferreyra', message: 'María, te recomiendo hacer antes la Masterclass de TypeScript, te va a facilitar muchísimo el tipado estricto.' },
    { senderUid: 'usr_client_07', senderName: 'Matías Romero', message: '¿Cuándo se habilita la entrega del proyecto final de Docker y Kubernetes?' },
    { senderUid: 'usr_admin', senderName: 'Administrador General', message: 'Ya está habilitada la entrega desde la sección de evaluaciones para todos los alumnos inscriptos.' }
  ];

  for (const m of forumMessages) {
    await prisma.chatMessage.create({ data: m });
  }
  console.log(`✅ Mensajes de foro inicializados.`);

  console.log('🎉 BASE DE DATOS COMPLETAMENTE POBLADA Y SINCRONIZADA.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
