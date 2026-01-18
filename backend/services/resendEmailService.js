// services/resendEmailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const emailTemplates = {
  welcome: (email, username) => ({
    from: 'Notes App <onboarding@resend.dev>', // Free domain
    to: email,
    subject: '🎉 Welcome to Notes App!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin-bottom: 10px;">Welcome to Notes App!</h1>
          <p style="color: #6B7280; font-size: 18px;">Hello ${username},</p>
        </div>
        
        <div style="background: #F9FAFB; padding: 25px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Thank you for signing up! We're excited to have you on board. 
            Start organizing your notes and ideas in one secure place.
          </p>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #4F46E5; margin-bottom: 15px;">What you can do:</h3>
            <ul style="color: #6B7280; padding-left: 20px;">
              <li style="margin-bottom: 8px;">📝 Create unlimited notes</li>
              <li style="margin-bottom: 8px;">🗂️ Organize with categories</li>
              <li style="margin-bottom: 8px;">🔒 Secure cloud storage</li>
              <li style="margin-bottom: 8px;">📱 Access from any device</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://lekhan.netlify.app'}/dashboard" 
               style="background: #4F46E5; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; 
                      font-weight: bold; font-size: 16px; display: inline-block;">
              Start Taking Notes
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; 
                   border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 14px;">
          <p>If you have any questions, reply to this email.</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} Notes App. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to Notes App, ${username}!\n\nThank you for signing up. Start organizing your notes at ${process.env.FRONTEND_URL || 'https://lekhan.netlify.app'}\n\nBest regards,\nThe Notes App Team`
  }),
};

const sendEmailViaResend = async (type, email, data = {}) => {
  console.log(`📧 [Resend] Attempting to send ${type} email to: ${email}`);
  
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not set. Logging email to console.');
      console.log(`📧 Would send ${type} email to: ${email}`);
      return { success: true, devMode: true };
    }

    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }

    const emailData = template(email, data.username || email.split('@')[0]);
    
    const { data: result, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error(`❌ Resend error:`, error);
      throw error;
    }

    console.log(`✅ Email sent via Resend! ID: ${result.id}`);
    return { 
      success: true, 
      devMode: false,
      messageId: result.id,
      result: result
    };
    
  } catch (error) {
    console.error(`❌ Resend sending failed:`, error.message);
    
    // Fallback to console logging
    console.log(`📧 Fallback - Would send ${type} email to: ${email}`);
    
    return { 
      success: true, // Still success for user signup
      devMode: true,
      error: error.message,
      message: 'Email logged (Resend failed)'
    };
  }
};

// Test function
const testResendEmail = async () => {
  console.log('\n🔧 Testing Resend email service...');
  const result = await sendEmailViaResend('welcome', 'test@example.com', { username: 'Test User' });
  return result;
};

module.exports = {
  sendEmailViaResend,
  testResendEmail
};