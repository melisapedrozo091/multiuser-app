import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import adminRoutes from './routes/admin.routes';
import chatRoutes from './routes/chat.routes';
import { firebaseAuthMiddleware } from './middlewares/auth.middleware';

const app = express();

// Middlewares globales
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);

// Protegemos todas las rutas siguientes con Firebase Auth
app.use(firebaseAuthMiddleware);

// Rutas protegidas
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

export default app;
