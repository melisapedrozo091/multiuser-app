import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

const mapEnrollment = (e: any) => ({
  id: e.code,         // Use code as display ID (e.g. INS-2026-001)
  dbId: e.id,         // Keep DB cuid for API PATCH calls
  userId: e.userId,
  userEmail: e.userEmail,
  userName: e.userName,
  courseId: e.courseId,
  courseName: e.courseName,
  price: e.price,
  currency: e.currency,
  date: e.date,
  createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
  pausedAt: e.pausedAt ? e.pausedAt.toISOString() : null,
  status: e.status,
  paymentMethod: e.paymentMethod,
  rating: e.rating,
  reviewComment: e.reviewComment,
  refundReason: e.refundReason,
  deletedFromUi: e.deletedFromUi
});

export const getEnrollments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userEmail = req.user?.email;
    const returnAll = req.query.all === 'true';

    // ADMIN, unauthenticated, or returnAll (metrics view) → return all enrollments
    if (!userRole || userRole === 'ADMIN' || returnAll) {
      const enrollments = await prisma.enrollment.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(enrollments.map(mapEnrollment));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { userEmail: userEmail || undefined },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(enrollments.map(mapEnrollment));
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener inscripciones', details: error.message });
  }
};

export const getInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    const where = (!userRole || userRole === 'ADMIN') ? {} : { userEmail: userEmail || undefined };
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener facturas', details: error.message });
  }
};

export const getCertificates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    const where = (!userRole || userRole === 'ADMIN') ? {} : { userEmail: userEmail || undefined };
    const certs = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    return res.json(certs);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener certificados', details: error.message });
  }
};

export const createEnrollment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?.uid || 'usr_client';
    const userName = req.body.userName || req.user?.displayName || userEmail;
    const { courseId, courseName, price, currency, paymentMethod } = req.body;

    if (!courseId || !courseName || !userEmail) {
      return res.status(400).json({ error: 'Datos de inscripción incompletos' });
    }

    // REGLA: Se debe poder inscribir una sola vez por curso con el mismo usuario
    const existing = await prisma.enrollment.findFirst({
      where: {
        userEmail,
        courseId: Number(courseId),
        status: { notIn: ['ANULADO', 'ELIMINADO'] }
      }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Ya estás inscripto en este curso. Cada usuario puede inscribirse únicamente una sola vez por curso.'
      });
    }

    const count = await prisma.enrollment.count();
    const code = `INS-2026-${String(count + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const newEnrollment = await prisma.enrollment.create({
      data: {
        code,
        userId,
        userEmail,
        userName,
        courseId: Number(courseId),
        courseName,
        price: Number(price) || 0,
        currency: currency || 'USD',
        date: today,
        status: 'INSCRIPTO',
        paymentMethod: paymentMethod || 'Tarjeta',
        deletedFromUi: false
      }
    });

    return res.status(201).json(newEnrollment);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al registrar inscripción en base de datos', details: error.message });
  }
};

export const updateEnrollment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, status, reason, rating, reviewComment } = req.body;
    const userRole = req.user?.role;
    const userEmail = req.user?.email;

    // Try to find by cuid first, then fallback to code
    let enrollment = await prisma.enrollment.findUnique({ where: { id } }).catch(() => null);
    if (!enrollment) {
      enrollment = await prisma.enrollment.findUnique({ where: { code: id } }).catch(() => null);
    }

    if (!enrollment) {
      if (action === 'DELETE' || status === 'ELIMINADO') {
        return res.status(200).json({ message: 'Suscripción removida de la vista visible (conservada en la BD para auditoría).' });
      }
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    // Use the actual DB id for updates
    const dbId = enrollment.id;

    if (userRole !== 'ADMIN' && enrollment.userEmail !== userEmail) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta inscripción' });
    }

    const now = new Date();

    // 1. ACCIÓN: PAUSAR / SUSPENDER
    if (action === 'PAUSE' || status === 'PAUSADO') {
      const updated = await prisma.enrollment.update({
        where: { id: dbId },
        data: {
          status: 'PAUSADO',
          pausedAt: now
        }
      });
      return res.json({ message: 'Curso pausado con éxito.', enrollment: updated });
    }

    // 2. ACCIÓN: REANUDAR (Restricción de 3 meses / 90 días desde que se frenó)
    if (action === 'RESUME' || status === 'REANUDAR') {
      if (enrollment.pausedAt) {
        const diffTime = Math.abs(now.getTime() - enrollment.pausedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
          return res.status(400).json({
            error: `Han transcurrido ${diffDays} días (más de 3 meses) desde que el curso fue pausado. El plazo límite de 90 días para reanudar ha vencido.`
          });
        }
      }

      const updated = await prisma.enrollment.update({
        where: { id: dbId },
        data: {
          status: 'EN_CURSO',
          pausedAt: null
        }
      });
      return res.json({ message: 'Curso reanudado con éxito.', enrollment: updated });
    }

    // 3. ACCIÓN: CANCELAR & REEMBOLSO (Botón de arrepentimiento - Válido hasta 3 meses de la solicitud)
    if (action === 'CANCEL' || status === 'ANULADO') {
      const diffTime = Math.abs(now.getTime() - enrollment.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 90 && userRole !== 'ADMIN') {
        return res.status(400).json({
          error: `Han transcurrido ${diffDays} días desde la inscripción. El plazo legal de 3 meses (90 días) para cancelar y solicitar reembolso ha expirado.`
        });
      }

      const updated = await prisma.enrollment.update({
        where: { id: dbId },
        data: {
          status: 'ANULADO',
          refundReason: reason || 'Cancelación por derecho de arrepentimiento'
        }
      });
      return res.json({ message: 'Inscripción cancelada y reembolso solicitado correctamente.', enrollment: updated });
    }

    // 4. ACCIÓN: ELIMINAR (Solo Admin - Borrado lógico de interfaz, conservado en la BD)
    if (action === 'DELETE' || status === 'ELIMINADO') {
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo los administradores pueden eliminar suscripciones.' });
      }

      const updated = await prisma.enrollment.update({
        where: { id: dbId },
        data: {
          deletedFromUi: true,
          status: 'ELIMINADO'
        }
      });
      return res.json({ message: 'Suscripción removida de la interfaz visible (conservada en la BD para auditoría).', enrollment: updated });
    }

    // 5. ACCIÓN: CALIFICAR CURSO
    if (action === 'RATE' || rating !== undefined) {
      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5 estrellas.' });
      }

      const updated = await prisma.enrollment.update({
        where: { id: dbId },
        data: {
          rating: numRating,
          reviewComment: reviewComment || null
        }
      });

      // Persistir también en la tabla CourseReview para visualización en el Foro
      try {
        const existingReview = await prisma.courseReview.findFirst({
          where: {
            userEmail: enrollment.userEmail,
            courseId: enrollment.courseId
          }
        });

        if (existingReview) {
          await prisma.courseReview.update({
            where: { id: existingReview.id },
            data: {
              rating: numRating,
              comment: reviewComment || 'Calificación del curso',
              userName: enrollment.userName,
              createdAt: new Date()
            }
          });
        } else {
          await prisma.courseReview.create({
            data: {
              courseId: enrollment.courseId,
              courseName: enrollment.courseName,
              userId: enrollment.userId,
              userEmail: enrollment.userEmail,
              userName: enrollment.userName,
              rating: numRating,
              comment: reviewComment || 'Calificación del curso'
            }
          });
        }
      } catch (reviewErr) {
        console.error('Error al guardar reseña en CourseReview:', reviewErr);
      }

      return res.json({ message: '¡Gracias por calificar el curso!', enrollment: updated });
    }

    return res.status(400).json({ error: 'Acción no especificada' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar inscripción', details: error.message });
  }
};
