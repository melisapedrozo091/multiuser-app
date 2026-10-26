import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

// Initial verified reviews to seed if MySQL CourseReview is empty
const INITIAL_SEED_REVIEWS = [
  {
    courseId: 1,
    courseName: 'Curso Completo de Desarrollo Web Fullstack',
    userId: 'usr_carlos_1',
    userEmail: 'carlos.mendoza@gmail.com',
    userName: 'Carlos Mendoza',
    rating: 5,
    comment: '¡Excelente curso! Los proyectos prácticos con Angular y Node.js me permitieron conseguir mi primer puesto como programador frontend. El material del temario está súper actualizado.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3)
  },
  {
    courseId: 2,
    courseName: 'Python para Ciencia de Datos e Inteligencia Artificial',
    userId: 'usr_lucia_2',
    userEmail: 'lucia.gomez@gmail.com',
    userName: 'Lucía Gómez',
    rating: 5,
    comment: 'Los módulos de Pandas y Scikit-Learn están muy bien explicados paso a paso. Resolvieron todas mis dudas en el foro con mucha rapidez.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5)
  },
  {
    courseId: 3,
    courseName: 'Diseño UX/UI & Prototipado con Figma Avanzado',
    userId: 'usr_mariano_3',
    userEmail: 'mariano.martinez@gmail.com',
    userName: 'Mariano Martínez',
    rating: 5,
    comment: 'Aprendí a crear un Design System completo desde cero. La dinámica del curso y los ejercicios semanales son de nivel profesional.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8)
  },
  {
    courseId: 4,
    courseName: 'DevOps: Docker, Kubernetes & CI/CD Pipelines',
    userId: 'usr_matias_4',
    userEmail: 'matias.vazquez@gmail.com',
    userName: 'Matías Vázquez',
    rating: 4,
    comment: 'Muy buen contenido práctico sobre despliegues automatizados y contenedores. Recomiendo tener nociones previas de Linux.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12)
  }
];

export const getReviews = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let reviews = await prisma.courseReview.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Seed default reviews if table is currently empty
    if (reviews.length === 0) {
      await prisma.courseReview.createMany({
        data: INITIAL_SEED_REVIEWS
      });
      reviews = await prisma.courseReview.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.json(reviews);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al consultar las reseñas', details: error.message });
  }
};

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, courseName, rating, comment } = req.body;
    const user = req.user;

    if (!user || !user.email) {
      return res.status(401).json({ error: 'Debes iniciar sesión para publicar una reseña.' });
    }

    const numRating = Number(rating);
    if (!courseId || !courseName || !numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Datos de reseña inválidos. La calificación debe ser entre 1 y 5 estrellas.' });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ error: 'El mensaje de reseña no puede estar vacío.' });
    }

    // Determine author display name
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    }).catch(() => null);

    const userName = dbUser?.displayName || user.displayName || user.name || user.email.split('@')[0];

    // Check if review already exists for this user and course, update or create
    const existingReview = await prisma.courseReview.findFirst({
      where: {
        userEmail: user.email,
        courseId: Number(courseId)
      }
    });

    let savedReview;
    if (existingReview) {
      savedReview = await prisma.courseReview.update({
        where: { id: existingReview.id },
        data: {
          rating: numRating,
          comment: comment.trim(),
          userName,
          createdAt: new Date()
        }
      });
    } else {
      savedReview = await prisma.courseReview.create({
        data: {
          courseId: Number(courseId),
          courseName,
          userId: user.uid || 'usr_' + Date.now(),
          userEmail: user.email,
          userName,
          rating: numRating,
          comment: comment.trim()
        }
      });
    }

    // Also update any enrollment of this user for this course
    await prisma.enrollment.updateMany({
      where: {
        userEmail: user.email,
        courseId: Number(courseId)
      },
      data: {
        rating: numRating,
        reviewComment: comment.trim()
      }
    }).catch(() => null);

    return res.status(201).json({
      message: '¡Reseña guardada con éxito en la base de datos!',
      review: savedReview
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al guardar la reseña en la base de datos', details: error.message });
  }
};
