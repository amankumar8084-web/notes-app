import emailjs from '@emailjs/browser';

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 Frontend: Attempting to send welcome email...');
  console.log('To:', userEmail);
  console.log('Username:', userName);
  
  try {
    // Use VITE_ prefix for environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_6b4x16e';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ra6l6ec';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'Mjrt59vo5ZEcSa_k_';
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      app_url: import.meta.env.VITE_FRONTEND_URL || window.location.origin,
      year: new Date().getFullYear()
    };

    console.log('📧 EmailJS Parameters:', {
      serviceId,
      templateId,
      publicKey,
      templateParams
    });

    // Remove emailjs.init() - not needed
    // Send email via EmailJS
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey // Add public key as the 4th parameter
    );

    console.log('✅ Frontend: Email sent successfully!', response);
    return { 
      success: true, 
      message: 'Welcome email sent successfully',
      response 
    };
    
  } catch (error) {
    console.error('❌ Frontend: Email sending failed:', error);
    console.error('Full error details:', {
      status: error.status,
      text: error.text,
      message: error.message
    });
    
    return { 
      success: false, 
      error: error.message,
      status: error.status
    };
  }
};

// Test function
export const testEmailService = async (testEmail = 'test@example.com') => {
  return await sendWelcomeEmail(testEmail, 'Test User');
};