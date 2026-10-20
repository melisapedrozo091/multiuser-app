# 🚀 Plataforma Multi-Usuario Standalone (Angular + Node/Express + Prisma)

Aplicación web full-stack que desarrollé con una arquitectura robusta, utilizando **Angular** para el frontend y una API en **Node.js (Express) + Prisma ** conectada a base de datos relacional, con autenticación centralizada mediante Firebase.

## 🛠️ Stack Tecnológico

* **Frontend:** Angular , TypeScript, RxJS, Chart.js, CSS Custom Properties (Soporte completo para Modo Claro / Modo Oscuro).
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL / MySQL.
* **Autenticación y Tiempo Real:** Firebase Auth & Firestore / REST API.
* **Control de Versiones:** Git con estrategia de ramas (`main`, `develop`, `feature/*`).

## ⚡️ Guía de Puesta en Marcha

### 1️⃣ Configuración del Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura las credenciales de tu base de datos y variables de entorno en el archivo .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev

```

### 2️⃣ Configuración del Frontend

```bash
cd frontend
npm install
npm start

```

Frontend disponible en `http://localhost:4200`.
Backend disponible en `http://localhost:3000`.

---

## 🔗 Repositorio en GitHub

El proyecto está versionado y estructurado bajo buenas prácticas de Git:

```bash
git remote add origin https://github.com/melisapedrozo091/multiuser-app.git
git branch -M main
git push -u origin main
```

