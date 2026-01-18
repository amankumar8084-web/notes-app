import emailjs from '@emailjs/browser';

// Initialize EmailJS once with your User ID
const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID || 'Mjrt59vo5ZEcSa_k_';
emailjs.init(EMAILJS_USER_ID);

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 Frontend: Attempting to send welcome email...');
  console.log('To:', userEmail);
  console.log('Username:', userName);
  
  try {
    // Get credentials - DON'T redefine userId here
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_6b4x16e';
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_ra6l6ec';
    // Remove this line: const userId = process.env.REACT_APP_EMAILJS_USER_ID || 'Mjrt59vo5ZEcSa_k_';
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      app_url: process.env.REACT_APP_FRONTEND_URL || window.location.origin,
      year: new Date().getFullYear()
    };

    console.log('📧 EmailJS Parameters:', {
      serviceId,
      templateId,
      templateParams
    });

    // Send email via EmailJS (frontend)
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('✅ Frontend: Email sent successfully!', response);
    return { 
      success: true, 
      message: 'Welcome email sent successfully',
      response 
    };
    
  } catch (error) {
    console.error('❌ Frontend: Email sending failed:', error);
    
    // Fallback: Show success anyway, just log error
    console.log('📧 Email would have been sent with proper configuration');
    
    return { 
      success: false, 
      error: error.message,
      fallback: 'Email logged to console. Check EmailJS configuration.'
    };
  }
};

// Test function
export const testEmailService = async (testEmail = 'test@example.com') => {
  return await sendWelcomeEmail(testEmail, 'Test User');
};