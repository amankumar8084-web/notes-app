// services/emailjsService.js - FIXED VERSION
const axios = require('axios');

console.log('📧 EmailJS Service Initialized');
console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Not Set');
console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Not Set');
console.log('EMAILJS_USER_ID:', process.env.EMAILJS_USER_ID ? '✅ Set' : '❌ Not Set');

const sendWelcomeEmail = async (email, username) => {
  console.log('\n📧 ===== EMAILJS SEND ATTEMPT =====');
  console.log(`To: ${email}`);
  console.log(`Username: ${username}`);
  
  try {
    // Check if EmailJS is configured
    if (!process.env.EMAILJS_SERVICE_ID || 
        !process.env.EMAILJS_TEMPLATE_ID || 
        !process.env.EMAILJS_USER_ID) {
      console.log('❌ EmailJS credentials not fully configured');
      console.log('💡 Add these to Render environment:');
      console.log('   - EMAILJS_SERVICE_ID');
      console.log('   - EMAILJS_TEMPLATE_ID'); 
      console.log('   - EMAILJS_USER_ID');
      
      return { 
        success: false, 
        error: 'EmailJS not configured',
        devMode: true,
        fallback: 'Email credentials missing'
      };
    }

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('❌ Invalid email address:', email);
      return { 
        success: false, 
        error: 'Invalid email address',
        devMode: true 
      };
    }

    console.log('✅ All checks passed. Preparing email...');
    
    const templateParams = {
      to_email: email,  // Make sure this is exactly 'to_email'
      to_name: username || 'User',
      from_name: 'Notes App',
      subject: `Welcome to Notes App, ${username || 'User'}!`,
      message: `Welcome ${username || 'User'}! Thank you for signing up for Notes App. Start organizing your notes and ideas in one secure place.`,
      app_url: process.env.FRONTEND_URL || 'https://lekhan.netlify.app',
      login_url: `${process.env.FRONTEND_URL || 'https://lekhan.netlify.app'}/login`,
      year: new Date().getFullYear(),
      user_email: email
    };

    console.log('📧 Template Parameters:');
    console.log('- to_email:', templateParams.to_email);
    console.log('- to_name:', templateParams.to_name);
    console.log('- subject:', templateParams.subject);
    
    console.log('🚀 Sending via EmailJS API...');
    
    const requestData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      template_params: templateParams,
      accessToken: process.env.EMAILJS_ACCESS_TOKEN // Optional
    };

    console.log('📧 Sending request to EmailJS...');
    
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`✅ EmailJS Response Status: ${response.status}`);
    console.log(`✅ Response Data:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log(`✅✅✅ EMAIL SENT SUCCESSFULLY via EmailJS!`);
      console.log(`📧 Sent to: ${email}`);
      console.log(`📧 Username: ${username}`);
      console.log('📧 ===== END (SUCCESS) =====\n');
      
      return { 
        success: true,
        service: 'EmailJS',
        status: response.status,
        data: response.data,
        devMode: false
      };
    } else {
      console.log(`❌ EmailJS returned non-200 status: ${response.status}`);
      return { 
        success: false, 
        error: `Status ${response.status}`,
        data: response.data 
      };
    }
    
  } catch (error) {
    console.error(`❌ EmailJS error occurred:`);
    console.error(`❌ Error message:`, error.message);
    
    if (error.response) {
      console.error(`❌ Response status:`, error.response.status);
      console.error(`❌ Response data:`, JSON.stringify(error.response.data, null, 2));
      
      // Specific error handling
      if (error.response.status === 422) {
        console.error('❌ 422 Error Details:');
        console.error('This usually means:');
        console.error('1. "to_email" parameter is missing or empty');
        console.error('2. Email template variables are not matching');
        console.error('3. Template ID or Service ID is wrong');
        
        // Check if we have the right template parameters
        console.error('\n💡 Checking template parameters:');
        console.error('Required in template: to_email, to_name, message, etc.');
        console.error('Make sure your EmailJS template uses these exact variable names');
      }
    } else if (error.request) {
      console.error(`❌ No response received from EmailJS`);
    } else {
      console.error(`❌ Setup error:`, error.message);
    }
    
    // Fallback to console logging
    console.log('\n📧 ===== FALLBACK EMAIL LOG =====');
    console.log('To:', email);
    console.log('Username:', username);
    console.log('Subject: Welcome to Notes App!');
    console.log('Message: Thank you for signing up!');
    console.log('Status: EmailJS failed, would send real email with correct setup');
    console.log('📧 =============================\n');
    
    return { 
      success: false, 
      error: error.message,
      devMode: true,
      fallback: 'Logged to console'
    };
  }
};

// Test function with better error reporting
const testEmailJS = async (testEmail = 'test@example.com') => {
  console.log('\n🔧🔧🔧 TESTING EMAILJS SERVICE 🔧🔧🔧');
  
  if (!testEmail || !testEmail.includes('@')) {
    console.log('❌ Invalid test email');
    return { success: false, error: 'Invalid email' };
  }
  
  const result = await sendWelcomeEmail(testEmail, 'Test User');
  
  console.log('📊 TEST RESULT:', result.success ? '✅ PASS' : '❌ FAIL');
  if (result.error) {
    console.log('📊 ERROR:', result.error);
  }
  if (result.devMode) {
    console.log('📊 MODE: Development (not sending real emails)');
  }
  console.log('🔧🔧🔧 TEST COMPLETE 🔧🔧🔧\n');
  
  return result;
};

module.exports = {
  sendWelcomeEmail,
  testEmailJS
};