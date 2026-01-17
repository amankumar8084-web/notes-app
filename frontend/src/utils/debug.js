export const debugAuth = () => {
  const token = localStorage.getItem('token');
  console.log('🔐 Auth Debug:');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length);
  console.log('Token (first 20 chars):', token?.substring(0, 20) + '...');
};

export const debugAPI = async () => {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test root endpoint
    const rootRes = await fetch('http://localhost:5000/');
    console.log('Root endpoint:', rootRes.status, rootRes.ok);
    
    // Test with token
    const token = localStorage.getItem('token');
    if (token) {
      const notesRes = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Notes endpoint:', notesRes.status, notesRes.ok);
      
      if (notesRes.ok) {
        const notes = await notesRes.json();
        console.log('Notes found:', notes.length);
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};