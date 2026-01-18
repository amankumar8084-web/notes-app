const nodemailer = require('nodemailer');

console.log('\n📧 ===== EMAIL SERVICE INITIALIZATION =====');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('============================================\n');

// Create transporter - FIXED FOR RENDER
const createTransporter = () => {
  // Check if we have Gmail credentials
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('🔧 Configuring Gmail transporter...');
    
    // IMPORTANT: Use these exact settings for Render
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Use 465 (SSL) instead of 587
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Important for Render
      },
      // Timeout settings
      connectionTimeout: 30000, // 30 seconds
      socketTimeout: 30000, // 30 seconds
      // Debug info
      logger: true,
      debug: true
    });
  }
  
  // No credentials - development mode
  console.log('⚠️ No email credentials found. Using DEVELOPMENT MODE.');
  console.log('💡 To send real emails, add EMAIL_USER and EMAIL_PASSWORD to environment variables');
  
  return {
    sendMail: (mailOptions) => {
      console.log('\n📧 ===== DEVELOPMENT EMAIL LOG =====');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Time:', new Date().toISOString());
      console.log('Note: This email was logged to console only');
      console.log('📧 ===================================\n');
      
      return Promise.resolve({
        messageId: 'dev-' + Date.now(),
        envelope: { to: [mailOptions.to] }
      });
    }
  };
};

const transporter = createTransporter();

// Verify connection (only for real SMTP)
if (transporter.verify) {
  transporter.verify()
    .then(() => console.log('✅ SMTP Connection verified successfully'))
    .catch(err => {
      console.log('❌ SMTP Connection failed:', err.message);
      console.log('💡 Try these fixes:');
      console.log('1. Use Gmail App Password (not regular password)');
      console.log('2. Enable 2-Step Verification on Google');
      console.log('3. Try Resend.com instead (easier with Render)');
    });
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
            <a href="${process.env.FRONTEND_URL || 'https://lekhan.netlify.app'}" 
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

// Send email function
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
      console.log('📧 Running in DEVELOPMENT MODE');
      await transporter.sendMail(mailOptions); // Logs to console
      return { 
        success: true, 
        devMode: true,
        message: 'Email logged to console (development mode)'
      };
    }

    console.log('📧 Sending REAL email via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ REAL EMAIL SENT SUCCESSFULLY!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
    return { 
      success: true, 
      devMode: false,
      message: 'Email sent successfully via Gmail',
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error(`❌ Email sending failed:`, error.message);
    
    // Check error type
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.error('⚠️ SMTP TIMEOUT - Common issue with Render free tier');
      console.error('💡 Try: 1. Use port 465 with secure: true');
      console.error('💡 Try: 2. Use Resend.com (recommended)');
      console.error('💡 Try: 3. Use Ethereal Email for testing');
    }
    
    if (error.code === 'EAUTH') {
      console.error('⚠️ AUTHENTICATION ERROR');
      console.error('Make sure:');
      console.error('1. 2-Step Verification is ENABLED');
      console.error('2. Using APP PASSWORD (16 chars from https://myaccount.google.com/apppasswords)');
      console.error('3. NOT your regular Gmail password');
    }
    
    // Fallback to console logging
    console.log('🔄 Falling back to console logging...');
    console.log('\n📧 ===== FALLBACK EMAIL LOG =====');
    console.log('To:', email);
    console.log('Subject: Welcome to Notes App');
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
  
  console.log('\n📊 TEST RESULT:');
  console.log('Success:', result.success ? '✅' : '❌');
  console.log('Real Email:', result.devMode ? '❌ (Development)' : '✅ (Production)');
  console.log('Message:', result.message);
  
  return result;
};

module.exports = {
  sendEmail,
  testEmailService
};