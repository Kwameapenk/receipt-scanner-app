import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";
import sharp from "sharp";

dotenv.config();

console.log("🔍 DEBUG: App starting...");
console.log("🔍 Current directory:", process.cwd());
console.log("🔍 Files in current directory:", fs.readdirSync('.'));

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

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
let client;

try {
  // Try using a credentials JSON file first
  const credentialsJson = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
  console.log("✓ Found service-account-key.json");
  console.log("  Project ID:", credentialsJson.project_id);
  console.log("  Service Account Email:", credentialsJson.client_email);
  console.log("  Private Key starts with:", credentialsJson.private_key.substring(0, 30));
  
  client = new vision.ImageAnnotatorClient({
    keyFilename: './service-account-key.json'
  });
  console.log("✓ Successfully initialized Vision client with service-account-key.json");
} catch (e) {
  // Fallback to environment variables
  console.log("⚠ Could not use service-account-key.json:", e.message);
  console.log("⚠ Falling back to environment variables");
  
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error("❌ ERROR: GOOGLE_PRIVATE_KEY not set in environment variables");
    process.exit(1);
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  
  console.log("DEBUG: Using environment variables");
  console.log("DEBUG: Private key starts with:", privateKey.substring(0, 50));
  console.log("DEBUG: Private key ends with:", privateKey.substring(privateKey.length - 50));
  console.log("DEBUG: Client email:", process.env.GOOGLE_CLIENT_EMAIL);
  
  client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });
}

// Upload endpoint
app.post("/upload", upload.single("receipt"), async (req, res) => {
  console.log("📤 Received file:", req.file);
  
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Check if file exists and get file stats
    const fileStats = fs.statSync(req.file.path);
    console.log("📁 File stats:");
    console.log("   - Path:", req.file.path);
    console.log("   - Size:", (fileStats.size / 1024 / 1024).toFixed(2), "MB");
    console.log("   - MIME type:", req.file.mimetype);
    
    // Read file as buffer
    let imageBuffer = fs.readFileSync(req.file.path);
    console.log("📁 Original image buffer size:", (imageBuffer.length / 1024 / 1024).toFixed(2), "MB");
    
    // Compress image if it's larger than 20MB
    if (imageBuffer.length > 20 * 1024 * 1024) {
      console.log("🗜️  Compressing image...");
      imageBuffer = await sharp(imageBuffer)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      console.log("🗜️  Compressed image buffer size:", (imageBuffer.length / 1024 / 1024).toFixed(2), "MB");
    }
    
    console.log("📸 Processing image with Google Vision...");
    // Send image as buffer to Google Vision
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer
      }
    });
    const detections = result.textAnnotations;
    
    console.log("📊 Detection results:");
    console.log("   - Total annotations found:", detections.length);
    
    if (detections.length > 0) {
      console.log("   - Full text length:", detections[0].description.length);
      console.log("   - First 100 chars:", detections[0].description.substring(0, 100));
    } else {
      console.log("   - ⚠️ No text detected in image");
    }
    
    const fullText = detections.length ? detections[0].description : "";

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({ 
      text: fullText,
      detections_found: detections.length,
      confidence: detections.length > 0 ? detections[0].confidence : 0
    });
  } catch (error) {
    console.error("❌ Error during OCR processing:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "OCR processing failed", details: error.message });
  }
});

const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("Receipt OCR API is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});