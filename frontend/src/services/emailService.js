// frontend/src/services/emailService.js - 100% WORKING VERSION
import emailjs from '@emailjs/browser';

// Initialize EmailJS ONCE - use PUBLIC KEY (User ID)
const EMAILJS_PUBLIC_KEY = 'Mjrt59vo5ZEcSa_k_';
let emailjsInitialized = false;

// Initialize function
const initializeEmailJS = () => {
  if (!emailjsInitialized) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      emailjsInitialized = true;
      console.log('✅ EmailJS initialized successfully');
    } catch (error) {
      console.error('❌ EmailJS initialization failed:', error);
    }
  }
};

// Initialize immediately
initializeEmailJS();

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 [EmailService] Sending to:', userEmail);
  console.log('📧 Username:', userName);
  
  // Ensure EmailJS is initialized
  if (!emailjsInitialized) {
    initializeEmailJS();
  }
  
  try {
    // HARDCODED VALUES - NO ENVIRONMENT VARIABLES
    const serviceId = 'service_6b4x16e';
    const templateId = 'template_ra6l6ec';
    
    // CRITICAL: These MUST match your EmailJS template variables
    const templateParams = {
      to_email: userEmail,    // Template uses {{to_email}}
      to_name: userName,      // Template uses {{to_name}}
      app_url: 'https://lekhan.netlify.app',
      year: new Date().getFullYear().toString()
    };

    console.log('📤 [EmailService] Sending with:', {
      serviceId,
      templateId,
      templateParams
    });

    // Send email - ONLY 3 PARAMETERS!
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('✅✅✅ [EmailService] EMAIL SENT SUCCESSFULLY!');
    console.log('Response:', response);
    
    return { 
      success: true, 
      message: 'Welcome email sent! Check your inbox.',
      response 
    };
    
  } catch (error) {
    console.error('❌❌❌ [EmailService] ERROR:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    
    return { 
      success: false, 
      error: error.text || error.message,
      status: error.status
    };
  }
};

// Test function
export const testEmailService = async () => {
  console.log('🧪 Testing EmailService...');
  return await sendWelcomeEmail('test@example.com', 'Test User');
};