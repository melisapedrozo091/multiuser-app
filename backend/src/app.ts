import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import reviewRoutes from './routes/review.routes';
import { firebaseAuthMiddleware } from './middlewares/auth.middleware';

const app = express();

// Middlewares globales
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());

// Redirección segura a la landing page pública del Frontend
app.get('/', (_req, res) => {
  res.redirect('http://localhost:4200/landing');
});

// Rutas (cada router aplica firebaseAuthMiddleware en los endpoints que requieren sesión)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);

// Endpoint de métricas de rendimiento global
import { getDashboardMetrics } from './controllers/admin.controller';
app.get('/api/metrics', getDashboardMetrics);

// Rutas 100% administrativas protegidas
app.use('/api/admin', firebaseAuthMiddleware, adminRoutes);

export default app;
