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

  // Create sample products
  await prisma.product.createMany({
    data: [
      {
        name: 'Servicio Cloud Premium',
        description: 'Infraestructura en la nube con alta disponibilidad 99.9%',
        price: 299.99,
        stock: 15,
        ownerId: admin.id
      },
      {
        name: 'Licencia Software Enterprise',
        description: 'Acceso ilimitado a herramientas de auditoría y reportes',
        price: 899.00,
        stock: 3,
        ownerId: admin.id
      },
      {
        name: 'Consultoría DevOps (Hora)',
        description: 'Asesoramiento técnico personalizado por expertos senior',
        price: 120.00,
        stock: 25,
        ownerId: client.id
      },
      {
        name: 'Paquete de Mantenimiento',
        description: 'Soporte 24/7 y actualizaciones de seguridad críticas',
        price: 450.00,
        stock: 2,
        ownerId: admin.id
      }
    ]
  });

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
