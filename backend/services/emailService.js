const nodemailer = require('nodemailer');

console.log('📧 Email Service Initializing...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Create transporter with Render-compatible settings
const createTransporter = () => {
  // Check if we're using Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('✅ Attempting to configure Gmail transporter...');
    
    // IMPORTANT: Use explicit Gmail SMTP settings for Render
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use port 587 (not 465)
      secure: false, // false for port 587
      requireTLS: true, // Important for Render
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // Don't reject unauthorized certificates (helps with Render)
        rejectUnauthorized: false
      },
      // Connection timeout settings for Render
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      // Debug logging
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
  } else if (process.env.EMAIL_HOST) {
    // Custom SMTP (like Ethereal)
    console.log('📧 Using custom SMTP:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development mode - log to console
    console.log('⚠️ No email credentials found. Using development mode.');
    return {
      sendMail: (mailOptions) => {
        console.log('\n📧 ===== EMAIL LOG (Development Mode) =====');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Time:', new Date().toISOString());
        console.log('Note: Add EMAIL_USER and EMAIL_PASSWORD to send real emails');
        console.log('📧 =========================================\n');
        
        return Promise.resolve({
          messageId: 'dev-' + Date.now(),
          envelope: { to: [mailOptions.to] }
        });
      }
    };
  }
};

const transporter = createTransporter();

// Verify transporter connection (only for real SMTP)
if (transporter.verify) {
  transporter.verify()
    .then(() => console.log('✅ SMTP Connection verified'))
    .catch(err => console.log('❌ SMTP Connection failed:', err.message));
}

// Email templates
const emailTemplates = {
  welcome: (userEmail) => ({
    from: `"Notes App" <${process.env.EMAIL_USER || 'noreply@notesapp.com'}>`,
    to: userEmail,
    subject: '🎉 Welcome to Notes App!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Notes App!</h1>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Thank you for creating an account with Notes App! We're excited to have you on board.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #4b5563; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">📝 Create and organize your notes</li>
              <li style="margin-bottom: 8px;">📱 Access from any device</li>
              <li style="margin-bottom: 8px;">🔒 Your data is securely stored</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app.netlify.app'}" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Start Taking Notes
            </a>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
              If you didn't create this account, please ignore this email or contact support.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Notes App. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to Notes App!\n\nThank you for creating an account. Start organizing your notes and ideas with our secure app.\n\nVisit: ${process.env.FRONTEND_URL || 'https://lekhan.netlify.app'}\n\nIf you didn't create this account, please ignore this email.`,
  }),
};

// Send email function with better error handling
const sendEmail = async (type, email, data = {}) => {
  console.log(`\n📧 Attempting to send ${type} email to: ${email}`);
  
  try {
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }

    const mailOptions = template(email, data);
    
    // Check if we're in development mode
    if (!transporter.sendMail || typeof transporter.sendMail !== 'function') {
      console.log('📧 Development mode - logging to console');
      await transporter.sendMail(mailOptions);
      return { 
        success: true, 
        devMode: true,
        message: 'Email logged (development mode)'
      };
    }

    // Set timeout for SMTP connection
    const sendEmailWithTimeout = () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SMTP connection timeout after 10 seconds'));
        }, 10000);

        transporter.sendMail(mailOptions)
          .then(info => {
            clearTimeout(timeout);
            resolve(info);
          })
          .catch(err => {
            clearTimeout(timeout);
            reject(err);
          });
      });
    };

    console.log('📧 Sending via Gmail SMTP...');
    const info = await sendEmailWithTimeout();
    
    console.log(`✅ REAL EMAIL SENT SUCCESSFULLY!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
    return { 
      success: true, 
      devMode: false,
      message: 'Email sent successfully via Gmail',
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error(`❌ Email sending failed for ${email}:`, error.message);
    
    // Check error type
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.error('⚠️ SMTP TIMEOUT - Render may be blocking Gmail connections');
      console.error('💡 Solutions:');
      console.error('1. Try port 465 with secure: true');
      console.error('2. Use Resend.com instead (recommended for Render)');
      console.error('3. Use Ethereal Email for testing');
    }
    
    if (error.code === 'EAUTH') {
      console.error('⚠️ AUTHENTICATION ERROR');
      console.error('Make sure:');
      console.error('1. 2-Step Verification is ENABLED on Google');
      console.error('2. You are using APP PASSWORD (16 characters)');
      console.error('3. NOT your regular Gmail password');
    }
    
    // Fallback to development mode
    console.log('🔄 Falling back to console logging...');
    const mailOptions = emailTemplates[type](email, data);
    console.log('\n📧 ===== FALLBACK EMAIL LOG =====');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Time:', new Date().toISOString());
    console.log('📧 =============================\n');
    
    return { 
      success: true, 
      devMode: true,
      error: error.message,
      message: 'Email failed, logged to console instead'
    };
  }
};

// Test function
const testEmailService = async () => {
  console.log('\n🔧 Testing email service...');
  const result = await sendEmail('welcome', 'test@example.com');
  console.log('Test result:', {
    success: result.success,
    devMode: result.devMode,
    message: result.message,
    error: result.error || 'none'
  });
  return result;
};

module.exports = {
  sendEmail,
  testEmailService
};