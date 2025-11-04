import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Check if required environment variables are set
if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error("Missing Google Cloud credentials in environment variables");
  console.error("Make sure these environment variables are set in your .env file:");
  console.error("- GOOGLE_CLIENT_EMAIL");
  console.error("- GOOGLE_PRIVATE_KEY");
  process.exit(1);
}

// Initialize Google Vision client
const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Replace the double backslashes with a single backslash and use proper escaping
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

// Upload endpoint
app.post("/upload", upload.single("receipt"), async (req, res) => {
  console.log("Received file:", req.file);
  
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const fullText = detections.length ? detections[0].description : "";

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({ text: fullText });
  } catch (error) {
    console.error("Error during OCR processing:", error);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Receipt OCR API is running ✅");
});

app.listen(PORT, () => {
  // Use string interpolation for correct console.log syntax
  console.log(`Server running on port ${PORT}`);
});
