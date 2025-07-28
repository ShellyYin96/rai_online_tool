// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://rai-online-tool-backend.onrender.com' 
  : 'http://localhost:3001');

// Default headers for API requests
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Helper function to make API requests with proper error handling
export const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  };

  try {
    console.log('Making API request to:', url);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

export default API_BASE_URL; 