import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";
import sharp from "sharp";
import logger from "./logger.js";

dotenv.config();
logger.info("Application starting...", { env: process.env.NODE_ENV || "development" });

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

// Configure multer to accept multiple image formats
const upload = multer({ 
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Accept common image formats
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format: ${file.mimetype}`));
    }
  }
});

// Initialize Google Vision client
let client;

try {
  const credentialsJson = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
  console.log("✓ Found service-account-key.json");
  console.log("  Project ID:", credentialsJson.project_id);
  console.log("  Service Account Email:", credentialsJson.client_email);
  
  client = new vision.ImageAnnotatorClient({
    keyFilename: './service-account-key.json'
  });
  console.log("✓ Successfully initialized Vision client with service-account-key.json");
} catch (e) {
  console.log("⚠ Could not use service-account-key.json:", e.message);
  console.log("⚠ Falling back to environment variables");
  
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error("❌ ERROR: GOOGLE_PRIVATE_KEY not set in environment variables");
    process.exit(1);
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  
  client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });
}

// Function to parse receipt text and extract universal fields
function parseReceiptText(rawText) {
  const receipt = {
    store_name: null,
    store_address: null,
    store_phone: null,
    transaction_date: null,
    transaction_time: null,
    items: [],
    subtotal: null,
    tax: null,
    total: null,
    payment_method: null,
    reference_number: null,
    raw_text: rawText
  };

  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line);

  // Extract store name (usually first line or near top)
  if (lines.length > 0) {
    receipt.store_name = lines[0];
  }

  // Extract date and time
  const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\w+\s+\d{1,2},?\s+\d{4})/gi;
  const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi;
  
  rawText.match(datePattern)?.forEach(match => {
    receipt.transaction_date = match;
  });
  
  rawText.match(timePattern)?.forEach(match => {
    receipt.transaction_time = match;
  });

  // Extract phone number
  const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})|(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/g;
  const phoneMatch = rawText.match(phonePattern);
  if (phoneMatch) {
    receipt.store_phone = phoneMatch[0];
  }

  // Extract address (usually contains street, city, province)
  const addressPattern = /(\d+\s+[\w\s]+(?:ST|St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard).*(?:ON|QC|BC|AB|MB|SK|NS|NB|PE|NL|YT|NT|NU).*\d{1}[A-Z]\d|.*\d{5}(?:-\d{4})?)/gi;
  const addressMatch = rawText.match(addressPattern);
  if (addressMatch) {
    receipt.store_address = addressMatch[0];
  }

  // Extract monetary amounts (TOTAL, SUBTOTAL, TAX)
  const amounts = rawText.match(/\$?\s*\d+\.\d{2}/g) || [];
  const totalPattern = /TOTAL:?\s*\$?\s*(\d+\.\d{2})/i;
  const subtotalPattern = /SUBTOTAL:?\s*\$?\s*(\d+\.\d{2})/i;
  const taxPattern = /(?:GST|HST|TAX|Sales Tax):?\s*\$?\s*(\d+\.\d{2})/i;

  const totalMatch = rawText.match(totalPattern);
  if (totalMatch) {
    receipt.total = parseFloat(totalMatch[1]);
  }

  const subtotalMatch = rawText.match(subtotalPattern);
  if (subtotalMatch) {
    receipt.subtotal = parseFloat(subtotalMatch[1]);
  }

  const taxMatch = rawText.match(taxPattern);
  if (taxMatch) {
    receipt.tax = parseFloat(taxMatch[1]);
  }

  // Extract payment method
  if (rawText.match(/DEBIT|debit/i)) {
    receipt.payment_method = "DEBIT";
  } else if (rawText.match(/CREDIT|credit/i)) {
    receipt.payment_method = "CREDIT";
  } else if (rawText.match(/CASH|cash/i)) {
    receipt.payment_method = "CASH";
  }

  // Extract reference number
  const referencePattern = /(?:Reference|Ref|REFERENCE|REF)[\s#:]*(\d+)/i;
  const refMatch = rawText.match(referencePattern);
  if (refMatch) {
    receipt.reference_number = refMatch[1];
  }

  // Extract items (simple approach - lines between items markers)
  const itemLines = lines.filter(line => 
    !line.match(/TOTAL|SUBTOTAL|PAYMENT|DEBIT|CREDIT|CASH|GST|HST/i) &&
    line.length > 3
  );
  receipt.items = itemLines.slice(0, 20); // Limit to first 20 lines

  return receipt;
}

// Upload endpoint
app.post("/upload", upload.single("receipt"), async (req, res) => {
  console.log("📤 Received file:", req.file);
  
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const fileStats = fs.statSync(req.file.path);
    console.log("📁 File stats:");
    console.log("   - Path:", req.file.path);
    console.log("   - Size:", (fileStats.size / 1024 / 1024).toFixed(2), "MB");
    console.log("   - MIME type:", req.file.mimetype);
    
    let imageBuffer = fs.readFileSync(req.file.path);
    console.log("📁 Original image buffer size:", (imageBuffer.length / 1024 / 1024).toFixed(2), "MB");
    
    // Always compress image to be safe
    console.log("🗜️  Compressing image...");
    try {
      imageBuffer = await sharp(imageBuffer)
        .resize(1500, 1500, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 70 })
        .toBuffer();
      console.log("🗜️  Compressed image buffer size:", (imageBuffer.length / 1024 / 1024).toFixed(2), "MB");
    } catch (sharpError) {
      console.error("⚠️  Sharp compression failed:", sharpError.message);
      console.log("📌 Attempting with original image...");
    }
    
    console.log("📸 Processing image with Google Vision...");
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer
      }
    });
    const detections = result.textAnnotations;
    
    console.log("📊 Detection results:");
    console.log("   - Total annotations found:", detections.length);
    
    const fullText = detections.length ? detections[0].description : "";
    
    // Parse the receipt text to extract universal fields
    const parsedReceipt = parseReceiptText(fullText);
    
    console.log("📋 Parsed receipt data:", JSON.stringify(parsedReceipt, null, 2));

    // Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true,
      receipt: parsedReceipt,
      raw_ocr_text: fullText,
      detections_found: detections.length
    });
  } catch (error) {
    console.error("❌ Error during OCR processing:", error.message);
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