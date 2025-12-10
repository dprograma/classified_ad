// API Configuration
export const API_CONFIG = {
  // Base API URL (with /api suffix)
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Base server URL (without /api suffix) - useful for storage URLs
  SERVER_URL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', ''),
  
  // App URL
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
};

// Helper functions
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};

export const getStorageUrl = (path) => {
  if (!path) return null;

  // If path is already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If path already includes 'storage/', use it as is
  if (path.startsWith('storage/')) {
    return `${API_CONFIG.SERVER_URL}/${path}`;
  }

  // Otherwise, prepend /storage/
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.SERVER_URL}/storage${cleanPath}`;
};

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // Already a full URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.SERVER_URL}${cleanPath}`;
};