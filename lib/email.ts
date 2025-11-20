import 'server-only';
import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
};

// Create transporter (reusable)
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // If no email config, use a test account (for development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️  SMTP credentials not configured. Using test account.');
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'test@ethereal.email',
          pass: 'test',
        },
      });
    } else {
      transporter = nodemailer.createTransport(emailConfig);
    }
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: `"New Holland Yedek Parça Bayi" <${process.env.SMTP_USER || 'noreply@newhollandbayi.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    // In development with test account, log the preview URL
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
      console.log('📧 Email sent (test mode):', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message || 'Email gönderilirken bir hata oluştu',
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  userEmail: string,
  userName: string,
  orderId: number,
  orderTotal: number,
  orderItems: Array<{ name: string; quantity: number; price: number }>
): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} ₺</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #003767; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; color: #003767; }
        .button { display: inline-block; padding: 12px 24px; background: #ffd300; color: #003767; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Siparişiniz Alındı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          <p>Siparişiniz başarıyla alınmıştır. Sipariş numaranız: <strong>#${orderId}</strong></p>
          
          <h3>Sipariş Detayları:</h3>
          <table>
            <thead>
              <tr style="background: #003767; color: white;">
                <th style="padding: 10px; text-align: left;">Ürün</th>
                <th style="padding: 10px; text-align: center;">Adet</th>
                <th style="padding: 10px; text-align: right;">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Toplam:</td>
                <td class="total" style="padding: 10px; text-align: right;">${orderTotal.toFixed(2)} ₺</td>
              </tr>
            </tfoot>
          </table>
          
          <p>Siparişinizin durumunu takip etmek için <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile/orders/${orderId}" class="button">Sipariş Detayı</a> sayfasını ziyaret edebilirsiniz.</p>
          
          <p>Teşekkür ederiz!</p>
          <p><strong>New Holland Yedek Parça Bayi</strong></p>
        </div>
        <div class="footer">
          <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Sipariş Onayı - #${orderId} - New Holland Yedek Parça Bayi`,
    html,
  });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(
  userEmail: string,
  userName: string,
  orderId: number,
  oldStatus: string,
  newStatus: string,
  trackingNumber?: string | null
): Promise<{ success: boolean; error?: string }> {
  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  };

  const statusColors: Record<string, string> = {
    PENDING: '#ffc107',
    CONFIRMED: '#0d6efd',
    SHIPPED: '#6f42c1',
    DELIVERED: '#198754',
    CANCELLED: '#dc3545',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #003767; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColors[newStatus] || '#666'}; color: white; border-radius: 20px; font-weight: bold; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #ffd300; color: #003767; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Sipariş Durumu Güncellendi</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          <p>Siparişinizin (#${orderId}) durumu güncellenmiştir:</p>
          
          <p style="margin: 20px 0;">
            <span style="text-decoration: line-through; color: #999;">${statusLabels[oldStatus] || oldStatus}</span>
            <span style="margin: 0 10px;">→</span>
            <span class="status-badge">${statusLabels[newStatus] || newStatus}</span>
          </p>
          
          ${trackingNumber ? `<p><strong>Kargo Takip Numarası:</strong> ${trackingNumber}</p>` : ''}
          
          <p>Siparişinizin detaylarını görmek için <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile/orders/${orderId}" class="button">Sipariş Detayı</a> sayfasını ziyaret edebilirsiniz.</p>
          
          <p>Teşekkür ederiz!</p>
          <p><strong>New Holland Yedek Parça Bayi</strong></p>
        </div>
        <div class="footer">
          <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Sipariş Durumu Güncellendi - #${orderId} - New Holland Yedek Parça Bayi`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #003767; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #ffd300; color: #003767; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Şifre Sıfırlama</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Güvenlik Uyarısı:</strong></p>
            <p>Bu link 1 saat süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız, lütfen bu emaili görmezden gelin.</p>
          </div>
          
          <p>Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
          <p style="word-break: break-all; color: #0d6efd;">${resetUrl}</p>
          
          <p>Teşekkür ederiz!</p>
          <p><strong>New Holland Yedek Parça Bayi</strong></p>
        </div>
        <div class="footer">
          <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Şifre Sıfırlama - New Holland Yedek Parça Bayi',
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #003767; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #ffd300; color: #003767; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${userName}</strong>,</p>
          <p>New Holland Yedek Parça Bayi'ne hoş geldiniz!</p>
          <p>Hesabınız başarıyla oluşturuldu. Artık tüm ürünlerimizi inceleyebilir, sipariş verebilir ve özel kampanyalardan haberdar olabilirsiniz.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products" class="button">Ürünleri Keşfet</a>
          </div>
          
          <p>Herhangi bir sorunuz olursa, bizimle iletişime geçmekten çekinmeyin.</p>
          
          <p>İyi alışverişler!</p>
          <p><strong>New Holland Yedek Parça Bayi</strong></p>
        </div>
        <div class="footer">
          <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Hoş Geldiniz - New Holland Yedek Parça Bayi',
    html,
  });
}

