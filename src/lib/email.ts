import nodemailer from 'nodemailer';

const isDevelopment = process.env.NODE_ENV === 'development';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Create transporter based on environment
function createTransporter() {
  // Jika ada SMTP config, gunakan itu
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 Using SMTP server:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development mode - gunakan Ethereal (fake SMTP untuk testing)
  console.log('📧 Using development mode (Ethereal)');
  return null; // Will create test account on demand
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    let transporter = createTransporter();

    // Jika development dan tidak ada SMTP config, gunakan Ethereal
    if (!transporter && isDevelopment) {
      console.log('📧 [DEV MODE] Creating test email account...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Test account created:', testAccount.user);
    }

    if (!transporter) {
      console.error('❌ No email configuration found');
      
      // Fallback: log ke console
      console.log('\n📧 ========== EMAIL LOG ==========');
      console.log('To:', to);
      console.log('Subject:', subject);
      
      // Extract reset URL
      const urlMatch = html.match(/href="([^"]+reset-password[^"]+)"/);
      if (urlMatch) {
        console.log('\n🔗 RESET PASSWORD URL:');
        console.log(urlMatch[1]);
        console.log('\n✅ Copy link di atas ke browser untuk reset password\n');
      }
      console.log('================================\n');
      
      return {
        success: true,
        data: { id: 'console-log-' + Date.now() },
      };
    }

    // Send email
    console.log('📧 Sending email to:', to);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"RS Panti Nugroho" <noreply@pantinugroho.com>',
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);

    // Jika development dengan Ethereal, tampilkan preview URL
    if (isDevelopment && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('\n📬 Preview email di browser:');
        console.log(previewUrl);
        console.log('');
      }
    }

    return {
      success: true,
      data: {
        id: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      },
    };
    
  } catch (error: any) {
    console.error('❌ Email error:', error);
    
    // Fallback: tetap log URL ke console jika email gagal
    const urlMatch = html.match(/href="([^"]+reset-password[^"]+)"/);
    if (urlMatch && isDevelopment) {
      console.log('\n⚠️  Email failed, but here is the reset URL:');
      console.log(urlMatch[1]);
      console.log('');
    }
    
    return {
      success: false,
      error: error?.message || 'Failed to send email',
    };
  }
}

export function generateResetPasswordEmail(resetUrl: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            padding: 30px; 
            text-align: center; 
            color: white; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9fafb; 
            padding: 30px; 
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
          }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #10b981; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .url-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
            color: #6b7280;
            margin: 15px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #6b7280; 
            font-size: 12px; 
            padding: 20px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">KAWAN DIABETES</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">RS Panti Nugroho</p>
          </div>
          <div class="content">
            <h2 style="color: #059669; margin-top: 0;">Halo, ${userName}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
            
            <p>Klik tombol di bawah ini untuk mereset password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password Sekarang</a>
            </div>
            
            <p style="margin-top: 30px;">Atau copy dan paste link berikut ke browser Anda:</p>
            <div class="url-box">${resetUrl}</div>
            
            <div class="warning">
              <strong style="color: #92400e;">⏰ Penting:</strong>
              <p style="margin: 5px 0 0 0; color: #92400e;">Link ini akan <strong>kadaluarsa dalam 1 jam</strong>.</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Jika Anda tidak meminta reset password, abaikan email ini. 
              Password Anda tidak akan berubah.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2025 RS Panti Nugroho</p>
            <p style="margin: 5px 0 0 0;">Semua hak dilindungi.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}