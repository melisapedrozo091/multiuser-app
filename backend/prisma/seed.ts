import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      id: 'usr_admin',
      email: 'admin@sistema.com',
      displayName: 'Administrador General',
      role: 'ADMIN'
    }
  });

  // Create default client user
  const client = await prisma.user.upsert({
    where: { email: 'cliente@gmail.com' },
    update: {},
    create: {
      id: 'usr_client',
      email: 'cliente@gmail.com',
      displayName: 'Carlos López',
      role: 'CLIENTE'
    }
  });

  // Delete existing products to re-seed cleanly
  await prisma.product.deleteMany({});

  // Create sample course products & services
  await prisma.product.createMany({
    data: [
      {
        name: 'Curso Completo de Desarrollo Web Fullstack (Angular & Node.js)',
        description: 'Aprende a construir aplicaciones escalables de principio a fin con Angular Standalone, Express y Prisma ORM.',
        price: 199.99,
        stock: 50,
        ownerId: admin.id
      },
      {
        name: 'Masterclass en TypeScript & Arquitectura Limpia',
        description: 'Domina los patrones de diseño, principios SOLID y arquitectura por capas aplicada a TypeScript.',
        price: 149.50,
        stock: 40,
        ownerId: admin.id
      },
      {
        name: 'Curso Avanzado de Bases de Datos & Prisma ORM',
        description: 'Diseño de esquemas relacionales, migraciones avanzadas, optimización de queries y relaciones en Prisma.',
        price: 89.99,
        stock: 30,
        ownerId: admin.id
      },
      {
        name: 'DevOps Professional: Docker, Kubernetes & CI/CD Pipelines',
        description: 'Contenerización de aplicaciones, despliegue continuo en la nube y configuración de pipelines automatizados.',
        price: 249.00,
        stock: 20,
        ownerId: admin.id
      },
      {
        name: 'Curso de Inteligencia Artificial & Prompt Engineering para Devs',
        description: 'Integración de LLMs, embeddings y herramientas de IA generativa en aplicaciones web modernas.',
        price: 179.00,
        stock: 35,
        ownerId: admin.id
      },
      {
        name: 'Seguridad Web & Autenticación con Firebase y JWT',
        description: 'Implementación de roles, permisos, OAuth2, verificación de tokens y buenas prácticas de ciberseguridad.',
        price: 129.99,
        stock: 25,
        ownerId: admin.id
      },
      {
        name: 'Diseño UI/UX y CSS Moderno para Desarrolladores',
        description: 'Crea interfaces responsivas, diseño dinámico, animaciones fluidas y experiencia de usuario de alto nivel.',
        price: 99.99,
        stock: 60,
        ownerId: client.id
      },
      {
        name: 'Consultoría Técnica y Mentoría 1-a-1 (Hora)',
        description: 'Sesión personalizada de asesoramiento en código, revisión de arquitectura y solución de dudas.',
        price: 120.00,
        stock: 15,
        ownerId: client.id
      }
    ]
  });

  // Seed sample forum chat messages if none exist
  const existingMsgs = await prisma.chatMessage.count();
  if (existingMsgs === 0) {
    await prisma.chatMessage.createMany({
      data: [
        {
          senderUid: admin.id,
          senderName: 'Soporte Academia Tech',
          message: '¡Bienvenido a la comunidad de Academia Tech! Deja aquí tus dudas sobre los cursos.'
        },
        {
          senderUid: client.id,
          senderName: 'Carlos López',
          message: '¿El curso de Fullstack en Angular & Node.js incluye proyectos reales desplegados?'
        },
        {
          senderUid: admin.id,
          senderName: 'Administrador General',
          message: '¡Hola Carlos! Sí, en el último módulo construimos y desplegamos la app completa a producción.'
        }
      ]
    });
  }


  console.log('✅ Base de datos sembrada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
