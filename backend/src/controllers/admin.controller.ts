import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';
import { firebaseAdmin } from '../services/firebase.service';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN.' });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al listar usuarios', details: error.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN.' });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'CLIENTE'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido. Usar ADMIN o CLIENTE.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    try {
      await firebaseAdmin.auth().setCustomUserClaims(id, { role });
    } catch (fbErr) {
      console.warn('Advertencia Firebase Custom Claims:', fbErr);
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al cambiar rol de usuario', details: error.message });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN.' });
  }

  const { email, password, displayName, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son requeridos.' });
  }

  const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENTE';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un usuario registrado con este correo.' });
    }

    const bcrypt = await import('bcryptjs');
    const { randomUUID } = await import('crypto');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    let firebaseUid: string = userId;
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      });
      firebaseUid = userRecord.uid;
      await firebaseAdmin.auth().setCustomUserClaims(firebaseUid, { role: assignedRole });
    } catch (fbErr: any) {
      console.warn('Firebase sync warning on admin createUser:', fbErr?.message);
    }

    const newUser = await prisma.user.create({
      data: {
        id: firebaseUid,
        email,
        password: hashedPassword,
        displayName: displayName || email.split('@')[0],
        role: assignedRole
      }
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al crear usuario', details: error.message });
  }
};

// Compute dynamic REAL metrics from database records
export const getDashboardMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalClients = await prisma.user.count({ where: { role: 'CLIENTE' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalCourses = await prisma.product.count();
    const totalForumQueries = await prisma.chatMessage.count();

    // Real reviews from MySQL CourseReview table
    const allReviews = await prisma.courseReview.findMany({ orderBy: { createdAt: 'desc' } });
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
      : 5.0;
    const clientSatisfactionRate = Math.round((avgRating / 5) * 100 * 10) / 10;

    const reviewsDistribution = {
      stars5: allReviews.filter(r => r.rating === 5).length,
      stars4: allReviews.filter(r => r.rating === 4).length,
      stars3: allReviews.filter(r => r.rating === 3).length,
      stars2: allReviews.filter(r => r.rating === 2).length,
      stars1: allReviews.filter(r => r.rating === 1).length,
      total: totalReviews
    };

    // Real enrollment stats from DB
    const enrollments = await prisma.enrollment.findMany({ where: { deletedFromUi: false } });
    const coursesInProgress = enrollments.filter(e => e.status === 'EN_CURSO').length;
    const coursesCompleted = enrollments.filter(e => e.status === 'FINALIZADO').length;
    const coursesCanceled = enrollments.filter(e => e.status === 'ANULADO').length;
    const coursesPaused = enrollments.filter(e => e.status === 'PAUSADO').length;
    const coursesEnrolled = enrollments.filter(e => e.status === 'INSCRIPTO').length;
    const totalRevenueUsd = enrollments
      .filter(e => (e.currency || 'USD').toUpperCase() === 'USD')
      .reduce((sum, e) => sum + e.price, 0);
    const totalRevenueArs = enrollments
      .filter(e => (e.currency || '').toUpperCase() === 'ARS')
      .reduce((sum, e) => sum + e.price, 0);

    // Top demanded courses by enrollment count
    const courseCountMap = new Map<string, { id: number; name: string; price: number; count: number }>();
    enrollments.forEach(e => {
      const cur = courseCountMap.get(e.courseName) || { id: e.courseId, name: e.courseName, price: e.price, count: 0 };
      cur.count += 1;
      courseCountMap.set(e.courseName, cur);
    });

    const topDemanded = Array.from(courseCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => {
        const cReviews = allReviews.filter(r => r.courseId === c.id || r.courseName.toLowerCase() === c.name.toLowerCase());
        const courseAvg = cReviews.length > 0
          ? (cReviews.reduce((sum, r) => sum + r.rating, 0) / cReviews.length).toFixed(1)
          : '5.0';
        return {
          id: c.id,
          name: c.name,
          price: c.price,
          rating: courseAvg,
          enrolledCount: c.count,
          satisfaction: `${Math.round((Number(courseAvg) / 5) * 100)}%`
        };
      });

    // If no enrollment data, fallback to product list
    let topDemandedCourses = topDemanded;
    if (topDemandedCourses.length === 0) {
      const products = await prisma.product.findMany({ take: 5, orderBy: { price: 'desc' } });
      topDemandedCourses = products.map((c) => {
        const cReviews = allReviews.filter(r => r.courseId === c.id || r.courseName.toLowerCase() === c.name.toLowerCase());
        const courseAvg = cReviews.length > 0
          ? (cReviews.reduce((sum, r) => sum + r.rating, 0) / cReviews.length).toFixed(1)
          : '5.0';
        return {
          id: c.id,
          name: c.name,
          price: c.price,
          rating: courseAvg,
          enrolledCount: 0,
          satisfaction: `${Math.round((Number(courseAvg) / 5) * 100)}%`
        };
      });
    }

    res.json({
      totalClients: Math.max(totalClients, 1),
      totalAdmins,
      totalCourses,
      totalForumQueries,
      totalReviews,
      averageRating: Number(avgRating.toFixed(1)),
      reviewsDistribution,
      coursesInProgress,
      coursesCompleted,
      coursesCanceled,
      coursesPaused,
      coursesEnrolled,
      clientSatisfactionRate,
      totalRevenueUsd: Math.round(totalRevenueUsd * 100) / 100,
      totalRevenueArs: Math.round(totalRevenueArs * 100) / 100,
      topDemandedCourses
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al calcular métricas de base de datos', details: error.message });
  }
};

// Bulk Import Courses (Admin Only)
export const importCourses = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN para importar cursos.' });
  }

  const { courses } = req.body;
  if (!Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ error: 'Se requiere un arreglo válido de cursos para importar.' });
  }

  const ownerId = req.user.uid;

  try {
    const createdCourses = [];
    for (const c of courses) {
      if (c.name && c.price) {
        const newCourse = await prisma.product.create({
          data: {
            name: c.name.trim(),
            description: c.description || 'Curso importado masivamente por el administrador.',
            price: Number(c.price),
            stock: Number(c.stock) || 50,
            ownerId
          }
        });
        createdCourses.push(newCourse);
      }
    }

    res.status(201).json({
      message: `🎉 Se han importado ${createdCourses.length} cursos nuevos a la base de datos con éxito.`,
      importedCount: createdCourses.length
    });
  } catch (error: any) {
    res.status(400).json({ error: 'Error al importar cursos en la base de datos', details: error.message });
  }
};
