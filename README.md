# 🚀 Plataforma Multi-Usuario Standalone (Angular + Node/Express + Prisma)

Aplicación web completa con arquitectura limpia, **Angular (Standalone Components)** en el Frontend y **Node.js (Express) + Prisma ORM + Firebase Auth** en el Backend.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Angular Standalone, TypeScript, RxJS, Chart.js, CSS Custom Properties (Temas Claro/Oscuro).
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL/MySQL.
- **Autenticación & Realtime:** Firebase Auth & Firestore / REST.
- **Control de Versiones:** Git (`main`, `develop`, `feature/*`).

---

## ⚡️ Guía de Inicio Rápido

### 1️⃣ Inicializar Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con la URL de tu base de datos relacional
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 2️⃣ Inicializar Frontend

```bash
cd frontend
npm install
npm start
```

Abre tu navegador en `http://localhost:4200`.

---

## 🔗 Vincular con GitHub

```bash
# En la raíz del proyecto:
git init
git checkout -b main
git add .
git commit -m "feat: inicializar proyecto completo multiusuario"
git branch -M main
git remote add origin https://github.com/melisapedrozo091/multiuser-app.git
git push -u origin main
```
