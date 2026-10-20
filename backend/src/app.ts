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

// Ruta de bienvenida / estado del Backend
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>API Backend - MultiUser App</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2.5rem; max-width: 520px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); text-align: center; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); color: #10b981; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-bottom: 1.25rem; }
        .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        h1 { margin: 0 0 0.5rem 0; font-size: 1.6rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.75rem; }
        .links { display: flex; flex-direction: column; gap: 0.85rem; }
        .btn { display: flex; align-items: center; justify-content: space-between; background: #334155; color: #f8fafc; padding: 0.9rem 1.25rem; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.92rem; transition: all 0.2s; }
        .btn:hover { background: #4f46e5; transform: translateY(-2px); }
        .btn-primary { background: #4f46e5; }
        .btn-primary:hover { background: #4338ca; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span> API ONLINE &bull; MYSQL CONECTADO</div>
        <h1>🚀 Servidor Backend Activo</h1>
        <p>Este es el servidor de datos (API REST). La interfaz gráfica de usuario está en el Frontend.</p>
        <div class="links">
          <a href="http://localhost:4200" class="btn btn-primary">
            <span>🌐 Abrir Aplicación Web (Frontend)</span>
            <span>&rarr;</span>
          </a>
          <a href="/api/products" class="btn">
            <span>📦 Ver Datos de Cursos en JSON (/api/products)</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Rutas (cada router aplica firebaseAuthMiddleware en los endpoints que requieren sesión)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Rutas 100% administrativas protegidas
app.use('/api/admin', firebaseAuthMiddleware, adminRoutes);

export default app;
