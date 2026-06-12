/**
 * SafeHaven Mailer
 *
 * En développement (SMTP_HOST absent) : les emails sont loggués dans la console.
 * En production : configure SMTP_HOST, SMTP_USER, SMTP_PASS dans .env
 *
 * Compatible avec : Gmail, Brevo, Resend, Mailgun, tout serveur SMTP.
 */

import nodemailer from 'nodemailer';

const APP_URL  = process.env['APP_URL']   ?? 'http://localhost:5173';
const FROM     = process.env['SMTP_FROM'] ?? 'SafeHaven <noreply@safehaven.app>';
const DEV_MODE = !process.env['SMTP_HOST'];

function createTransport() {
  if (DEV_MODE) return null;
  return nodemailer.createTransport({
    host:   process.env['SMTP_HOST']!,
    port:   parseInt(process.env['SMTP_PORT'] ?? '587', 10),
    secure: process.env['SMTP_SECURE'] === 'true',
    auth: {
      user: process.env['SMTP_USER']!,
      pass: process.env['SMTP_PASS']!,
    },
  });
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.log('\n📧 [Mailer DEV — email non envoyé, affiché ici]');
    console.log(`   À      : ${to}`);
    console.log(`   Sujet  : ${subject}`);
    console.log(`   Contenu: ${html.replace(/<[^>]+>/g, '').trim().slice(0, 200)}`);
    console.log('');
    return;
  }
  await transport.sendMail({ from: FROM, to, subject, html });
}

// ── Email de bienvenue ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#0f172a">Bienvenue sur SafeHaven, ${name} 👋</h2>
      <p style="color:#475569">Votre compte a bien été créé.</p>
      <p style="color:#475569">
        SafeHaven vous accompagne dans votre éducation financière et vous donne accès
        à des outils DeFi sécurisés sur Solana.
      </p>
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;margin-top:16px;padding:12px 24px;
                background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Accéder à mon dashboard
      </a>
      <p style="margin-top:32px;font-size:12px;color:#94a3b8">
        Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
      </p>
    </div>`;
  await send(to, '🛡️ Bienvenue sur SafeHaven !', html);
}

// ── Email de réinitialisation ──────────────────────────────────────────────────

export async function sendResetEmail(to: string, name: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
      <h2 style="color:#0f172a">Réinitialisation de votre mot de passe</h2>
      <p style="color:#475569">Bonjour ${name},</p>
      <p style="color:#475569">
        Vous avez demandé à réinitialiser votre mot de passe SafeHaven.
        Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong>1 heure</strong>.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;margin-top:16px;padding:12px 24px;
                background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Réinitialiser mon mot de passe
      </a>
      <p style="margin-top:16px;font-size:12px;color:#64748b;word-break:break-all">
        Lien : ${resetUrl}
      </p>
      <p style="margin-top:32px;font-size:12px;color:#94a3b8">
        Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.
      </p>
    </div>`;
  await send(to, '🔑 Réinitialisation de votre mot de passe SafeHaven', html);
}
