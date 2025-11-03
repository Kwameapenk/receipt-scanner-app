# receipt-scanner-app
A receipt scanner for shoppers

# Receipt OCR Tracker

An **open-source web application** that scans shopping receipts using **Optical Character Recognition (OCR)** and automatically populates the extracted data into a **Google Sheet**.  
Built with React (frontend) and Node.js (backend), it is **mobile-first**, **web-accessible**, and designed for personal or small business use.

---

## 🚀 Features
- Scan or upload receipt images (camera & file upload)
- Extract data like store name, total amount, date, and tax
- Auto-fill data into Google Sheets via Google Sheets API
- Mobile-first responsive design
- Secure and easy to self-host

---

## 🧠 Tech Stack
**Frontend:** React + Tailwind CSS  
**Backend:** Node.js + Express  
**OCR Engine:** Google Vision API or Tesseract.js  
**Storage:** Google Sheets (via API)  
**Deployment:** Vercel (frontend) + Render (backend)

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/receipt-ocr-tracker.git
cd receipt-ocr-tracker
