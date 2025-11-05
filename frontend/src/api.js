import axios from "axios";

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || "https://your-production-backend-url.com";
  }
  return process.env.REACT_APP_API_URL || "http://localhost:5050";
};

const API_URL = getApiUrl();

console.log("API URL:", API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 second timeout for large file uploads
});

// Upload receipt to backend
export const uploadReceipt = async (formData) => {
  try {
    console.log("Uploading receipt to:", `${API_URL}/upload`);
    
    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("Upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading receipt:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      }
    });
    
    // Provide user-friendly error messages
    if (error.response?.status === 400) {
      throw new Error("Invalid file format. Please upload an image.");
    } else if (error.response?.status === 500) {
      throw new Error(`Server error: ${error.response.data?.details || "OCR processing failed"}`);
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Upload timeout. Please try a smaller file.");
    } else if (!error.response) {
      throw new Error(`Cannot connect to server at ${API_URL}. Is the backend running?`);
    } else {
      throw error;
    }
  }
};

// Optional: Add a health check endpoint
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get("/");
    return response.data;
  } catch (error) {
    console.error("Backend health check failed:", error.message);
    throw error;
  }
};