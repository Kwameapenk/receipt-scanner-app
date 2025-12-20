import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
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
    logger.debug("File upload filter check", { originalname: file.originalname, mimetype: file.mimetype });
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimes.includes(file.mimetype)) {
      logger.debug("File format accepted", { mimetype: file.mimetype });
      cb(null, true);
    } else {
      const error = new Error(`Unsupported file format: ${file.mimetype}`);
      logger.warn("File format rejected", { mimetype: file.mimetype });
      cb(error);
    }
  }
});

// Initialize Google Vision client
let client;

try {
  const credentialsJson = JSON.parse(fs.readFileSync('./service-account-key.json', 'utf8'));
  logger.success("Found service-account-key.json", { 
    projectId: credentialsJson.project_id,
    email: credentialsJson.client_email
  });
  
  client = new vision.ImageAnnotatorClient({
    keyFilename: './service-account-key.json'
  });
  logger.success("Successfully initialized Vision client");
} catch (e) {
  logger.warn("Could not use service-account-key.json, falling back to environment variables", { error: e.message });
  
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    logger.error("GOOGLE_PRIVATE_KEY not set in environment variables");
    process.exit(1);
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  
  client = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });
  logger.success("Vision client initialized using environment variables");
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

  if (lines.length > 0) {
    receipt.store_name = lines[0];
  }

  const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\w+\s+\d{1,2},?\s+\d{4})/gi;
  const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi;
  
  rawText.match(datePattern)?.forEach(match => {
    receipt.transaction_date = match;
  });
  
  rawText.match(timePattern)?.forEach(match => {
    receipt.transaction_time = match;
  });

  const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})|(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/g;
  const phoneMatch = rawText.match(phonePattern);
  if (phoneMatch) {
    receipt.store_phone = phoneMatch[0];
  }

  const addressPattern = /(\d+\s+[\w\s]+(?:ST|St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard).*(?:ON|QC|BC|AB|MB|SK|NS|NB|PE|NL|YT|NT|NU).*\d{1}[A-Z]\d|.*\d{5}(?:-\d{4})?)/gi;
  const addressMatch = rawText.match(addressPattern);
  if (addressMatch) {
    receipt.store_address = addressMatch[0];
  }

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

  if (rawText.match(/DEBIT|debit/i)) {
    receipt.payment_method = "DEBIT";
  } else if (rawText.match(/CREDIT|credit/i)) {
    receipt.payment_method = "CREDIT";
  } else if (rawText.match(/CASH|cash/i)) {
    receipt.payment_method = "CASH";
  }

  const referencePattern = /(?:Reference|Ref|REFERENCE|REF)[\s#:]*(\d+)/i;
  const refMatch = rawText.match(referencePattern);
  if (refMatch) {
    receipt.reference_number = refMatch[1];
  }

  const itemLines = lines.filter(line => 
    !line.match(/TOTAL|SUBTOTAL|PAYMENT|DEBIT|CREDIT|CASH|GST|HST/i) &&
    line.length > 3
  );
  receipt.items = itemLines.slice(0, 20);

  return receipt;
}

// Upload endpoint
app.post("/upload", upload.single("receipt"), async (req, res) => {
  const requestId = `REQ-${Date.now()}`;
  
  try {
    logger.logStep("File Upload", "started", { requestId });
    
    if (!req.file) {
      logger.warn("No file uploaded", { requestId });
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    logger.logStep("File Validation", "completed", { 
      requestId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const fileStats = fs.statSync(req.file.path);
    logger.debug("File stats retrieved", { 
      requestId,
      path: req.file.path,
      sizeInMB: (fileStats.size / 1024 / 1024).toFixed(2)
    });
    
    let imageBuffer = fs.readFileSync(req.file.path);
    logger.logStep("Image Read", "completed", { 
      requestId,
      bufferSizeInMB: (imageBuffer.length / 1024 / 1024).toFixed(2)
    });
    
    logger.logStep("Image Compression", "started", { requestId });
    try {
      imageBuffer = await sharp(imageBuffer)
        .resize(1500, 1500, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 70 })
        .toBuffer();
      logger.logStep("Image Compression", "completed", { 
        requestId,
        compressedSizeInMB: (imageBuffer.length / 1024 / 1024).toFixed(2)
      });
    } catch (sharpError) {
      logger.warn("Image compression failed, using original", { 
        requestId,
        error: sharpError.message 
      });
    }
    
    logger.logStep("Google Vision OCR", "started", { requestId });
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer
      }
    });
    const detections = result.textAnnotations;
    logger.logStep("Google Vision OCR", "completed", { 
      requestId,
      detectionsFound: detections.length
    });
    
    const fullText = detections.length ? detections[0].description : "";
    
    logger.logStep("Receipt Parsing", "started", { requestId });
    const parsedReceipt = parseReceiptText(fullText);
    logger.logStep("Receipt Parsing", "completed", { 
      requestId,
      storeName: parsedReceipt.store_name,
      total: parsedReceipt.total,
      paymentMethod: parsedReceipt.payment_method
    });

    fs.unlinkSync(req.file.path);
    logger.debug("Temporary file deleted", { requestId, path: req.file.path });

    logger.success("Receipt processing completed successfully", { 
      requestId,
      storeName: parsedReceipt.store_name,
      totalAmount: parsedReceipt.total
    });

    // Log the complete receipt data
    logger.info("Receipt data processed", {
      requestId,
      receipt: parsedReceipt
    });

    res.json({ 
      success: true,
      requestId,
      receipt: parsedReceipt,
      raw_ocr_text: fullText,
      detections_found: detections.length
    });
  } catch (error) {
    logger.error("Receipt processing failed", error);
    logger.logStep("Receipt Processing", "failed", { 
      requestId,
      errorMessage: error.message
    });
    
    res.status(500).json({ 
      success: false,
      requestId,
      error: "OCR processing failed", 
      details: error.message 
    });
  }
});

// Endpoint to view logs
app.get("/logs", (req, res) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    const combinedLogPath = path.join(logsDir, 'combined.log');
    const errorLogPath = path.join(logsDir, 'error.log');
    
    let combinedLog = '';
    let errorLog = '';
    
    if (fs.existsSync(combinedLogPath)) {
      combinedLog = fs.readFileSync(combinedLogPath, 'utf-8');
    }
    
    if (fs.existsSync(errorLogPath)) {
      errorLog = fs.readFileSync(errorLogPath, 'utf-8');
    }
    
    res.json({
      combined: combinedLog.split('---\n').filter(l => l.trim()).slice(-50), // Last 50 logs
      errors: errorLog.split('---\n').filter(l => l.trim()).slice(-20), // Last 20 errors
      message: 'View logs at /logs'
    });
  } catch (error) {
    res.json({ error: 'Could not read logs', details: error.message });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Receipt OCR API is running ✅");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  logger.success("Server started successfully", { 
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});