const nodemailer = require('nodemailer');

// Create transporter with better configuration
const createTransporter = () => {
  // Check if we're using Gmail or custom SMTP
  if (process.env.EMAIL_HOST) {
    // Custom SMTP (like Ethereal)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Gmail
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development mode - log to console
    console.log('📧 Email service: Running in development mode');
    return {
      sendMail: (mailOptions) => {
        console.log('\n📧 ===== EMAIL LOG =====');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Time:', new Date().toISOString());
        if (process.env.NODE_ENV === 'development') {
          console.log('HTML Preview:', mailOptions.html?.substring(0, 150) + '...');
        }
        console.log('📧 ====================\n');
        
        return Promise.resolve({
          messageId: 'dev-' + Date.now(),
          envelope: { to: [mailOptions.to] }
        });
      }
    };
  }
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  welcome: (userEmail) => ({
    from: `"Notes App" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Welcome to Notes App!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Notes App!</h1>
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
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
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
    text: `Welcome to Notes App!\n\nThank you for creating an account. Start organizing your notes and ideas with our secure app.\n\nVisit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n\nIf you didn't create this account, please ignore this email.`,
  }),
};

// Send email function
const sendEmail = async (type, email, data = {}) => {
  try {
    console.log(`📧 Attempting to send ${type} email to: ${email}`);
    
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }

    const mailOptions = template(email, data);
    
    // Check if we're in development mode (no real transporter)
    if (!transporter.sendMail || typeof transporter.sendMail !== 'function') {
      // Development mode - log and return success
      await transporter.sendMail(mailOptions); // This logs to console
      console.log(`✅ Email logged (development mode): ${email}`);
      return { 
        success: true, 
        message: 'Email logged in development mode',
        devMode: true 
      };
    }

    // Real email sending
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Real email sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      devMode: false
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Full error:', error);
    
    // Special handling for common Gmail errors
    if (error.code === 'EAUTH') {
      console.error('\n⚠️ Authentication failed. Possible issues:');
      console.error('1. 2-Step Verification not enabled');
      console.error('2. Using regular password instead of App Password');
      console.error('3. App Password incorrect');
      console.error('Solution: Generate new App Password at: https://myaccount.google.com/apppasswords\n');
    }
    
    // Don't throw error to prevent signup failure
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Test function
const testEmailService = async () => {
  console.log('\n🔧 Testing email service...');
  console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('Email Password:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
  console.log('Mode:', process.env.EMAIL_USER ? 'Production' : 'Development');
  
  const result = await sendEmail('welcome', 'test@example.com');
  console.log('Test result:', result);
  return result;
};

module.exports = {
  sendEmail,
  testEmailService,
};