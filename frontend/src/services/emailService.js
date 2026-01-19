import emailjs from '@emailjs/browser';

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('📧 Frontend: Attempting to send welcome email...');
  console.log('To:', userEmail);
  console.log('Username:', userName);
  
  try {
    // USE VITE ENVIRONMENT VARIABLES
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_6b4x16e';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ra6l6ec';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'Mjrt59vo5ZEcSa_k_';
    
    // IMPORTANT: Use 'email' NOT 'to_email' (matches your template)
    const templateParams = {
      email: userEmail,          // This matches {{email}} in your template
      user_name: userName,       // This matches {{user_name}} in your template
      user_email: userEmail,     // Optional: also send email for template body
      app_url: import.meta.env.VITE_FRONTEND_URL || window.location.origin,
      year: new Date().getFullYear().toString()
    };

    console.log('📧 EmailJS Parameters:', {
      serviceId,
      templateId,
      publicKey,
      templateParams
    });

    // NEW EmailJS syntax: 4 parameters required
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey  // 4th parameter is public key
    );

    console.log('✅ Email sent successfully!', response);
    return { 
      success: true, 
      message: 'Welcome email sent successfully',
      response 
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error details:', {
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