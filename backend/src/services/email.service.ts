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

