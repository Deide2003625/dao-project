import nodemailer from 'nodemailer';

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Fonction pour envoyer un email
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'DAO Project'}" <${process.env.EMAIL_FROM || 'noreply@dao-project.com'}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Email envoyé avec succès:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer une notification de dépôt
export async function sendDepositNotification(adminEmail: string, daoName: string, daysUntil: number) {
  const isOverdue = daysUntil < 0;
  const daysText = isOverdue ? `il y a ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}` : `dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
  
  const subject = isOverdue ? ' Date de dépôt dépassée' : '⚠️ Date de dépôt approche';
  const color = isOverdue ? '#dc3545' : '#f59e0b';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notification DAO Project</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4b49ac, #7da0fa); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 500;">DAO Project</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Système de Notifications</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <div style="background-color: rgba(${color}, 0.2); border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="color: ${color}; margin: 0 0 10px 0; font-size: 18px;">${subject}</h2>
            <p style="color: #333; margin: 0; font-size: 16px; line-height: 1.5;">
              Le DAO <strong>"${daoName}"</strong> ${isOverdue ? 'était dû' : 'doit être déposé'} <strong>${daysText}</strong>.
            </p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 4px; border: 1px solid #dee2e6;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 16px;">Actions recommandées :</h3>
            <ul style="color: #495057; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Vérifier l'état d'avancement du DAO "${daoName}"</li>
              <li style="margin-bottom: 8px;">Contacter le chef de projet concerné</li>
              <li style="margin-bottom: 8px;">Prendre les mesures nécessaires pour finaliser le dépôt</li>
              ${isOverdue ? '<li style="margin-bottom: 8px;">Analyser les raisons du retard</li>' : ''}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dash/admin" 
               style="display: inline-block; background: linear-gradient(135deg, #4b49ac, #7da0fa); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
              Accéder au Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; margin: 0; font-size: 14px;">
            Cet email a été généré automatiquement par le système DAO Project.<br>
            Veuillez ne pas répondre à cet email.
          </p>
          <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 12px;">
            © 2024 DAO Project. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(adminEmail, subject, html);
}
