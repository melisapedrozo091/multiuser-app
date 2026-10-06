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

// Rutas (cada router aplica firebaseAuthMiddleware en los endpoints que requieren sesión)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Rutas 100% administrativas protegidas
app.use('/api/admin', firebaseAuthMiddleware, adminRoutes);

export default app;
