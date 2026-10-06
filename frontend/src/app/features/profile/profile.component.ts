import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(public auth: AuthService) {}

  downloadSyllabusPdf(): void {
    const user = this.auth.currentUser;
    const content = `
====================================================
           ACADEMIA TECH - PLAN DE ESTUDIOS
====================================================
Estudiante: ${user?.displayName || 'Usuario'}
Email: ${user?.email}
Rol: ${user?.role}
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}
----------------------------------------------------

PROGRAMA ACADÉMICO Y MÓDULOS DE ESTUDIO 2026:

1. MÓDULO 1: FUNDAMENTOS & ARQUITECTURA LIMPIA
   - Principios SOLID en TypeScript
   - Estructura Standalone en Angular y RxJS
   - Configuración de Servidores Express y Prisma ORM

2. MÓDULO 2: DESARROLLO DE API REST & BASE DE DATOS
   - Esquemas relacionales y migraciones SQLite / Postgres
   - Autenticación con JWT & Custom Claims en Firebase
   - Middlewares de seguridad y roles (ADMIN / CLIENTE)

3. MÓDULO 3: DEVOPS, CONTENERIZACIÓN & DEPLOYMENT
   - Contenerización con Docker y Docker Compose
   - Integración Continua (CI/CD) en GitHub Actions
   - Despliegue en la nube con monitoreo de métricas

----------------------------------------------------
Soporte Académico: soporte@academiatech.com
Atención al Cliente: 0810-333-TECH (8324)
====================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plan_de_Estudios_${user?.email || 'Alumno'}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
