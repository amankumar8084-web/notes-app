// frontend/src/services/emailService.js - FINAL WORKING VERSION
import emailjs from '@emailjs/browser';

// Initialize ONCE
const EMAILJS_PUBLIC_KEY = 'Mjrt59vo5ZEcSa_k_';
let emailjsInitialized = false;

const initializeEmailJS = () => {
  if (!emailjsInitialized) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsInitialized = true;
    console.log('✅ EmailJS initialized');
  }
};

// Initialize immediately
initializeEmailJS();

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 Sending welcome email to:', userEmail);
  
  // Ensure initialized
  if (!emailjsInitialized) {
    initializeEmailJS();
  }
  
  try {
    const serviceId = 'service_6b4x16e';
    const templateId = 'template_ra6l6ec';
    
    const templateParams = {
    to_email: userEmail,       // ✅ CORRECT - matches {{to_email}} in template
    to_name: userName,         // ✅ CORRECT - matches {{to_name}} in template
    user_email: userEmail,     // Optional - for template body if needed
    app_url: import.meta.env.VITE_FRONTEND_URL || window.location.origin,
    year: new Date().getFullYear().toString()
};

    console.log('📤 Sending email via EmailJS...');
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY!');
    return { 
      success: true, 
      message: 'Welcome email sent! Check your inbox.',
      response 
    };
    
  } catch (error) {
    console.error('❌ Email error:', error);
    return { 
      success: false, 
      error: error.text || error.message
    };
  }
};

// Optional: Test function
export const testEmailService = () => {
  return sendWelcomeEmail('test@example.com', 'Test User');
};