import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // from your .env

// Upload receipt to backend
export const uploadReceipt = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading receipt:", error);
    throw error;
  }
};
