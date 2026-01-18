// services/emailjsService.js
const axios = require('axios');

const sendWelcomeEmail = async (email, username) => {
  console.log('\n📧 ===== EMAILJS SEND ATTEMPT =====');
  console.log(`To: ${email}`);
  console.log(`Username: ${username}`);
  
  try {
    // Check if EmailJS is configured
    if (!process.env.EMAILJS_SERVICE_ID || 
        !process.env.EMAILJS_TEMPLATE_ID || 
        !process.env.EMAILJS_USER_ID) {
      console.log('❌ EmailJS credentials not set');
      console.log('💡 Add to Render environment variables:');
      console.log('   - EMAILJS_SERVICE_ID');
      console.log('   - EMAILJS_TEMPLATE_ID'); 
      console.log('   - EMAILJS_USER_ID');
      return { success: false, error: 'EmailJS not configured' };
    }

    const templateParams = {
      to_email: email,
      to_name: username,
      from_name: 'Notes App',
      message: 'Welcome to Notes App! Start organizing your notes today.',
      app_url: process.env.FRONTEND_URL || 'https://lekhan.netlify.app',
      year: new Date().getFullYear()
    };

    console.log('🚀 Sending via EmailJS API...');
    
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: templateParams,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN // Optional
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'origin': process.env.FRONTEND_URL || 'https://lekhan.netlify.app'
        }
      }
    );

    if (response.status === 200) {
      console.log(`✅✅✅ EMAIL SENT SUCCESSFULLY via EmailJS!`);
      console.log(`📧 To: ${email}`);
      console.log(`📧 Status: ${response.status}`);
      console.log('📧 ===== END =====\n');
      
      return { 
        success: true,
        service: 'EmailJS',
        status: response.status
      };
    } else {
      console.log(`❌ EmailJS returned status: ${response.status}`);
      return { success: false, error: `Status ${response.status}` };
    }
    
  } catch (error) {
    console.error(`❌ EmailJS error:`, error.message);
    console.error(`❌ Full error:`, error.response?.data || error);
    
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data
    };
  }
};

// Test function
const testEmailJS = async (testEmail = 'test@example.com') => {
  console.log('\n🔧 Testing EmailJS service...');
  const result = await sendWelcomeEmail(testEmail, 'Test User');
  return result;
};

module.exports = {
  sendWelcomeEmail,
  testEmailJS
};