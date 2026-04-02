const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const Usage = require("../models/Usage");

const router = express.Router();

// ─────────────────────────────────────
// Helper — Current billing month
// ─────────────────────────────────────
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// 📂 Storage config (tenant-wise folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `storage/${req.user.tenantId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


// ================== ✅ UPLOAD ==================
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const fileSizeGB = req.file.size / (1024 * 1024 * 1024);
    const tenantId = req.user.tenantId;

    console.log("Uploading for tenant:", tenantId); // ← ADD
    console.log("File size GB:", fileSizeGB);        // ← ADD

    const result = await Usage.findOneAndUpdate(
      { tenantId, billingMonth: getCurrentMonth() },
      { $inc: { storageGB: fileSizeGB, apiCalls: 1, bandwidthGB: 0 } },
      { upsert: true, returnDocument: 'after' }
    );

    console.log("MongoDB result:", result);          // ← ADD

    res.json({
      message: "File uploaded successfully",
      file: req.file.filename,
    });
  } catch (err) {
    console.log("Upload error:", err.message);       // ← ADD
    res.status(500).json({ error: err.message });
  }
});


// ================== 📃 LIST FILES ==================
router.get("/", protect, (req, res) => {
  try {
    const dir = `storage/${req.user.tenantId}`;

    if (!fs.existsSync(dir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(dir);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== 📥 DOWNLOAD ==================
router.get("/:filename", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const filePath = `storage/${tenantId}/${req.params.filename}`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const stats = fs.statSync(filePath);
    const fileSizeGB = stats.size / (1024 * 1024 * 1024);

    // ✅ Sirf MongoDB update karo
    await Usage.findOneAndUpdate(
      { tenantId, billingMonth: getCurrentMonth() },
      { $inc: { storageGB: 0, apiCalls: 1, bandwidthGB: fileSizeGB } },
      { upsert: true, returnDocument: "after" }
    );

    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== ❌ DELETE ==================
router.delete("/:filename", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const filePath = `storage/${tenantId}/${req.params.filename}`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const stats = fs.statSync(filePath);
    const fileSizeGB = stats.size / (1024 * 1024 * 1024);

    fs.unlinkSync(filePath);

    // ✅ MongoDB mein storage minus karo
    await Usage.findOneAndUpdate(
      { tenantId, billingMonth: getCurrentMonth() },
      { $inc: { storageGB: -fileSizeGB, apiCalls: 1, bandwidthGB: 0 } },
      { upsert: true, returnDocument: "after" }
    );

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
