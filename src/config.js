// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rai-online-tool-backend.onrender.com' 
  : 'http://localhost:3001';

export default API_BASE_URL; 