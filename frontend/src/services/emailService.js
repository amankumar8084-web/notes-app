import emailjs from '@emailjs/browser';


const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_6b4x16e',
  TEMPLATE_ID: 'template_ra6l6ec',
  PUBLIC_KEY: 'Mjrt59vo5ZEcSa_k_'
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  console.log('🚀 [EMAIL] Starting sendWelcomeEmail');
  console.log('To:', userEmail);
  console.log('Name:', userName);
  
  try {
    
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    
    
    const templateParams = {
      to_email: userEmail,      
      to_name: userName,        
      user_email: userEmail,    
      app_url: 'https://lekhan.netlify.app',
      year: new Date().getFullYear().toString()
    };

    console.log('📤 [EMAIL] Sending with params:', templateParams);

    // Send email
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    console.log('✅ [EMAIL] Success!', response);
    return { 
      success: true, 
      message: 'Welcome email sent successfully',
      response: response
    };
    
  } catch (error) {
    console.error('❌ [EMAIL] Error:', error);
    console.error('Error status:', error.status);
    console.error('Error text:', error.text);
    
    return { 
      success: false, 
      error: error.text || error.message,
      status: error.status
    };
  }
};