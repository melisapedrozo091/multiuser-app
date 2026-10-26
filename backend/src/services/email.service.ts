import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  // Use environment variables if SMTP credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development mode fallback: Ethereal test account or console logger
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Ethereal Email test account initialized:', testAccount.user);
    } catch (err) {
      console.warn('⚠️ Could not initialize Ethereal email test account, falling back to JSON transport.');
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
}

export async function sendWelcomeEmail(toEmail: string, displayName: string, role: string): Promise<void> {
  try {
    const transport = await getTransporter();

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 700;">⚡ MultiUser App</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">¡Tu cuenta ha sido creada exitosamente!</p>
        </div>
        
        <div style="padding: 30px; color: #1e293b;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">¡Hola, ${displayName}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Bienvenido/a a la plataforma. Nos complace informarte que tu registro ha finalizado correctamente con los siguientes detalles:
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>📧 Correo Electrónico:</strong> ${toEmail}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>🛡️ Rol Asignado:</strong> <span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${role}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>📅 Fecha de Registro:</strong> ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}</p>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Ya puedes explorar todas nuestras funciones disponibles en el catálogo y servicios interactivos.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:4200/login" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
              Ir a la Plataforma 🚀
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Este es un correo automático enviado por MultiUser App. Por favor no respondas a este mensaje.
        </div>
      </div>
    `;

    const sender = process.env.SMTP_USER ? `"MultiUser App ⚡" <${process.env.SMTP_USER}>` : '"MultiUser App ⚡" <no-reply@multiuserapp.com>';

    const info = await transport.sendMail({
      from: sender,
      to: toEmail,
      subject: `🎉 ¡Bienvenido/a a MultiUser App, ${displayName}!`,
      text: `¡Hola ${displayName}! Tu cuenta (${toEmail}) ha sido creada con éxito con el rol ${role}.🏼`,
      html: htmlContent
    });

    console.log(`✉️ Email de bienvenida enviado a: ${toEmail}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Vista previa del correo (Ethereal): ${previewUrl}`);
    }
  } catch (error: any) {
    console.error('❌ Error al enviar el correo de bienvenida:', error.message);
  }
}

export async function sendPasswordResetEmail(toEmail: string, displayName: string, resetCode: string): Promise<void> {
  try {
    const transport = await getTransporter();

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 700;">🔑 Restablecer Contraseña</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Academia Tech - Solicitud de Recuperación</p>
        </div>
        
        <div style="padding: 30px; color: #1e293b;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">¡Hola, ${displayName}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta (<strong>${toEmail}</strong>).
          </p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px;"><strong>🔑 Código de Verificación:</strong> <code style="font-size: 18px; font-weight: 700; color: #b45309;">${resetCode}</code></p>
            <p style="margin: 4px 0; font-size: 12px; color: #92400e;">Utiliza este código en la pantalla de Iniciar Sesión para definir tu nueva contraseña.</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:4200/login" style="background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
              Ir a la Plataforma 🚀
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.
        </div>
      </div>
    `;

    const sender = process.env.SMTP_USER ? `"Academia Tech 🔑" <${process.env.SMTP_USER}>` : '"Academia Tech 🔑" <no-reply@academiatech.com>';

    const info = await transport.sendMail({
      from: sender,
      to: toEmail,
      subject: `🔑 Restablecimiento de Contraseña - Academia Tech`,
      text: `Hola ${displayName}, tu código de restauración de contraseña es: ${resetCode}`,
      html: htmlContent
    });

    console.log(`✉️ Correo de recuperación de contraseña enviado a: ${toEmail}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Vista previa del correo de recuperación (Ethereal): ${previewUrl}`);
    }
  } catch (error: any) {
    console.error('❌ Error al enviar el correo de recuperación:', error.message);
  }
}

export async function sendArrepentimientoEmail(
  toEmail: string,
  fullName: string,
  trackingNumber: string,
  orderCode?: string,
  dni?: string,
  reason?: string
): Promise<void> {
  try {
    const transport = await getTransporter();
    const sender = process.env.SMTP_USER ? `"Academia Tech" <${process.env.SMTP_USER}>` : '"Academia Tech" <no-reply@academiatech.com>';

    // 1. Email al alumno (confirmación de recepción)
    const clientHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🔄 Solicitud de Revocación</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Academia Tech — Ley N° 24.240 / 26.361</p>
        </div>
        <div style="padding: 30px; color: #1e293b;">
          <h2 style="margin-top: 0; color: #0f172a;">Hola, ${fullName} 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Hemos recibido tu solicitud de revocación de compra (Botón de Arrepentimiento) de conformidad con la Ley N° 24.240 de Defensa del Consumidor.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">N° de Trámite</p>
            <span style="font-size: 22px; font-weight: 800; color: #dc2626; letter-spacing: 2px;">${trackingNumber}</span>
            ${orderCode ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;">Curso/Producto: <strong>${orderCode}</strong></p>` : ''}
          </div>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            El reintegro se procesará en tu medio de pago original dentro de las <strong>48 a 72 horas hábiles</strong>. Podés hacer seguimiento con el número de trámite indicado arriba.
          </p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">¿Dudas? Escribinos a <a href="mailto:soporte@academiatech.com" style="color: #dc2626;">soporte@academiatech.com</a></p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: toEmail,
      subject: `🔄 Solicitud de Revocación Confirmada — Trámite ${trackingNumber}`,
      text: `Hola ${fullName}, tu solicitud de revocación fue recibida. N° de Trámite: ${trackingNumber}`,
      html: clientHtml
    });

    // 2. Email al ADMINISTRADOR (soyunbesotuboca@gmail.com) para que revise la cancelación
    const adminEmail = 'soyunbesotuboca@gmail.com';
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden;">
        <div style="background: #ef4444; color: #ffffff; padding: 20px 25px;">
          <h2 style="margin: 0; font-size: 20px;">🚨 [NUEVA SOLICITUD] Botón de Arrepentimiento / Cancelación</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Notificación para el Administrador de Academia Tech</p>
        </div>
        <div style="padding: 25px; color: #1e293b;">
          <p style="font-size: 15px; line-height: 1.5;">
            Un alumno ha enviado una <strong>solicitud de cancelación total de suscripción</strong> mediante el Botón de Arrepentimiento:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold; width: 40%;">N° de Trámite:</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">${trackingNumber}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Alumno:</td><td style="padding: 8px;">${fullName}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Email del Alumno:</td><td style="padding: 8px;">${toEmail}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">DNI:</td><td style="padding: 8px;">${dni || 'No informado'}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Curso / Pedido:</td><td style="padding: 8px;">${orderCode || 'Cancelación total'}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Motivo informado:</td><td style="padding: 8px; font-style: italic;">${reason || 'Sin motivo especificado'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Fecha y Hora:</td><td style="padding: 8px;">${new Date().toLocaleString('es-AR')}</td></tr>
          </table>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 15px; font-size: 13px; color: #991b1b;">
            <strong>Acción para el Administrador:</strong> Según el plazo estimado del curso (10 días de compra según Ley 24.240), puedes proceder a cancelar la suscripción del alumno desde el <em>Panel de Métricas & Registro Histórico</em>.
          </div>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: adminEmail,
      subject: `🚨 [SOLICITUD CANCELACIÓN] Trámite ${trackingNumber} - Alumno: ${fullName}`,
      text: `Nueva solicitud de cancelación para el trámite ${trackingNumber}. Alumno: ${fullName} (${toEmail}). Motivo: ${reason}`,
      html: adminHtml
    });

    console.log(`✉️ Correo de arrepentimiento enviado a alumno: ${toEmail} y Admin: ${adminEmail} | Trámite: ${trackingNumber}`);
  } catch (error: any) {
    console.error('❌ Error al enviar correo de arrepentimiento:', error.message);
  }
}
