import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Receipt OCR API is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
