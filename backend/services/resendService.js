const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('📧 Resend Service Initialized');

const sendWelcomeEmail = async (userEmail) => {
  try {
    console.log(`📧 Resend: Sending welcome email to ${userEmail}`);
    
    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY not configured');
      console.log('💡 Add RESEND_API_KEY to Render environment variables');
      return {
        success: false,
        error: 'RESEND_API_KEY not configured',
        devMode: true
      };
    }
    
    // Extract username from email
    const username = userEmail.split('@')[0];
    
    const { data, error } = await resend.emails.send({
      from: 'Notes App <onboarding@resend.dev>',
      to: userEmail,
      subject: '🎉 Welcome to Notes App!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 2px solid #e5e7eb; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">Welcome to Notes App!</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>Thank you for creating an account with <strong>Notes App</strong>! We're excited to have you on board.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">🚀 Get Started:</h3>
              <ul style="color: #4b5563;">
                <li>📝 Create and organize unlimited notes</li>
                <li>📱 Access from any device</li>
                <li>🔒 End-to-end encryption for security</li>
                <li>⚡ Fast and intuitive interface</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="https://lekhan.netlify.app" class="button">
                Start Taking Notes
              </a>
            </div>
            
            <p>Or log in here: <a href="https://lekhan.netlify.app/login">https://lekhan.netlify.app/login</a></p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Notes App. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Notes App!\n\nHi ${username},\n\nThank you for creating an account. Start organizing your notes and ideas with our secure app.\n\nVisit: https://lekhan.netlify.app\n\n- Notes App Team`
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email sent successfully via Resend!');
    console.log('📧 Email ID:', data.id);
    
    return {
      success: true,
      provider: 'resend',
      emailId: data.id,
      message: 'Email sent via Resend'
    };

  } catch (error) {
    console.error('❌ Resend error:', error.message);
    
    // Fallback to console logging
    console.log('\n📧 ===== FALLBACK EMAIL LOG =====');
    console.log('To:', userEmail);
    console.log('Subject: Welcome to Notes App');
    console.log('Time:', new Date().toISOString());
    console.log('📧 =============================\n');
    
    return {
      success: true,
      provider: 'console',
      devMode: true,
      message: 'Email logged to console'
    };
  }
};

// Test function
const testResend = async () => {
  console.log('\n🔧 Testing Resend service...');
  const result = await sendWelcomeEmail('test@example.com');
  console.log('Test result:', result);
  return result;
};

module.exports = {
  sendWelcomeEmail,
  testResend
};