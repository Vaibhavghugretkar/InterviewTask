import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request. Please check your input.');
        case 401:
          throw new Error('Unauthorized. Please check your credentials.');
        case 403:
          throw new Error('Access forbidden. You don\'t have permission to perform this action.');
        case 404:
          throw new Error('Service not found. Please try again later.');
        case 413:
          throw new Error('File too large. Please upload a smaller file.');
        case 429:
          throw new Error('Too many requests. Please wait a moment before trying again.');
        case 500:
          throw new Error(data.message || 'Server error. Please try again later.');
        default:
          throw new Error(data.message || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

// API service methods
export const apiService = {
  // Upload and analyze document
  analyzeDocument: async (file, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post('/upload/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  },

  // Get supported document types
  getSupportedTypes: async () => {
    try {
      const response = await api.get('/upload/supported-types');
      return response.data;
    } catch (error) {
      console.error('Get supported types error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Upload service health check
  uploadHealthCheck: async () => {
    try {
      const response = await api.get('/upload/health');
      return response.data;
    } catch (error) {
      console.error('Upload health check error:', error);
      throw error;
    }
  },
};

// Utility functions
export const fileUtils = {
  // Validate file before upload
  validateFile: (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('No file selected');
      return errors;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be an image (JPEG, PNG, GIF, BMP, or WebP)');
    }

    return errors;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file preview URL
  getFilePreview: (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  },

  // Cleanup file preview URL
  cleanupFilePreview: (url) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  },
};

export default api;