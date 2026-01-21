// frontend/src/services/emailService.js - CORRECTED VERSION
import emailjs from '@emailjs/browser';

// Initialize EmailJS ONCE
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'Mjrt59vo5ZEcSa_k_';
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 Sending welcome email to:', userEmail);
  console.log('Username:', userName);
  
  try {
    // Get credentials - Use React environment variables
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_6b4x16e';
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_ra6l6ec';
    
    // CORRECT: Use EXACT variable names that match your template
    const templateParams = {
      to_email: userEmail,      // Must match template {{to_email}}
      to_name: userName,        // Must match template {{to_name}}
      app_url: process.env.REACT_APP_FRONTEND_URL || 'https://lekhan.netlify.app',
      year: new Date().getFullYear().toString()
    };

    console.log('📤 Sending with:', {
      serviceId,
      templateId,
      templateParams
    });

    // CORRECT: emailjs.send() takes ONLY 3 parameters
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
      // NO 4th parameter here!
    );

    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Response:', response);
    
    return { 
      success: true, 
      message: 'Welcome email sent successfully!',
      response 
    };
    
  } catch (error) {
    console.error('❌❌❌ EMAIL ERROR:', {
      status: error.status,
      text: error.text,
      message: error.message,
      fullError: error
    });
    
    return { 
      success: false, 
      error: error.text || error.message,
      status: error.status
    };
  }
};

// Test function
export const testEmailService = async (testEmail = 'test@example.com') => {
  return await sendWelcomeEmail(testEmail, 'Test User');
};