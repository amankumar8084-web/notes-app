// services/resendEmailService.js
const { Resend } = require('resend');

// DON'T initialize here - wait until we check for API key
let resendInstance = null;

// Initialize Resend only when needed
const getResendInstance = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    console.log('✅ Initializing Resend with API key');
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

const emailTemplates = {
  welcome: (email, username) => ({
    from: 'Notes App <onboarding@resend.dev>',
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
  console.log('\n📧 ===== EMAIL SEND ATTEMPT =====');
  console.log(`Type: ${type}`);
  console.log(`To: ${email}`);
  console.log(`Username: ${data.username || email.split('@')[0]}`);
  console.log(`RESEND_API_KEY exists? ${!!process.env.RESEND_API_KEY}`);
  
  try {
    // Check if API key exists FIRST
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY is NOT SET in environment variables!');
      console.log('💡 Go to Render → Environment → Add RESEND_API_KEY');
      console.log('💡 Value should start with: re_xxxxxxxxxx');
      console.log('📧 Email logged to console only');
      console.log('📧 ===== END (NO API KEY) =====\n');
      return { 
        success: false, 
        devMode: true,
        error: 'RESEND_API_KEY not set'
      };
    }
    
    console.log('✅ API Key found! Checking format...');
    
    // Validate API key format
    if (!process.env.RESEND_API_KEY.startsWith('re_')) {
      console.log('❌ API Key format wrong! Should start with "re_"');
      console.log('💡 Get new key from https://resend.com/api-keys');
      return { 
        success: false, 
        error: 'Invalid API key format'
      };
    }

    console.log('✅ API Key format correct!');
    
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }

    const username = data.username || email.split('@')[0];
    const emailData = template(email, username);
    
    console.log('🚀 Attempting to send via Resend...');
    
    // Get Resend instance (lazy initialization)
    const resend = getResendInstance();
    if (!resend) {
      throw new Error('Failed to initialize Resend');
    }
    
    const { data: result, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.log('❌ Resend API returned error:', error);
      console.log('📧 ===== END (RESEND ERROR) =====\n');
      return { 
        success: false, 
        error: error.message || 'Resend API error'
      };
    }

    console.log(`✅✅✅ EMAIL SENT SUCCESSFULLY!`);
    console.log(`📧 Email ID: ${result.id}`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: ${emailData.subject}`);
    console.log('📧 ===== END (SUCCESS) =====\n');
    
    return { 
      success: true, 
      devMode: false,
      messageId: result.id,
      emailId: result.id
    };
    
  } catch (error) {
    console.error(`❌ Catch block error:`, error.message);
    console.error(`❌ Full error:`, error);
    console.log('📧 ===== END (CATCH ERROR) =====\n');
    
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
};

// Test function with detailed logging
const testResendEmail = async (testEmail = 'test@example.com') => {
  console.log('\n🔧🔧🔧 TESTING RESEND SERVICE 🔧🔧🔧');
  console.log('Test email:', testEmail);
  
  const result = await sendEmailViaResend('welcome', testEmail, { 
    username: 'Test User' 
  });
  
  console.log('📊 TEST RESULT:', result.success ? '✅ PASS' : '❌ FAIL');
  console.log('🔧🔧🔧 TEST COMPLETE 🔧🔧🔧\n');
  
  return result;
};

module.exports = {
  sendEmailViaResend,
  testResendEmail
};