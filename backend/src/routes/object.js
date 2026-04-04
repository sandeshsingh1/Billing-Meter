const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const Usage = require("../models/Usage");
const { internalClient, externalClient, ensureBucket } = require("../config/minio");

const router = express.Router();

// ✅ multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper — billing month
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// ================== ✅ UPLOAD ==================
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const tenantId = req.user.tenantId;
    const fileName = Date.now() + "-" + file.originalname;

    await ensureBucket(tenantId);

    // 🔹 Upload to MinIO
    await internalClient.putObject(
      tenantId,
      fileName,
      file.buffer
    );

    // 🔹 Billing update
    const fileSizeGB = file.size / (1024 * 1024 * 1024);

    await Usage.findOneAndUpdate(
      { tenantId, billingMonth: getCurrentMonth() },
      { $inc: { storageGB: fileSizeGB, apiCalls: 1, bandwidthGB: 0 } },
      { upsert: true }
    );

    res.json({
      message: "File uploaded successfully",
      file: fileName,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 📃 LIST FILES ==================
router.get("/", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const files = [];

    const stream = internalClient.listObjects(tenantId, "", true);

    stream.on("data", obj => files.push(obj.name));
    stream.on("end", () => res.json(files));
    stream.on("error", err => res.status(500).json({ error: err.message }));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 📥 DOWNLOAD ==================
router.get("/download/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    const stream = await internalClient.getObject(tenantId, fileName);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    stream.pipe(res);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ❌ DELETE ==================
router.delete("/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    const stat = await internalClient.statObject(tenantId, fileName);
    const fileSizeGB = stat.size / (1024 * 1024 * 1024);

    await internalClient.removeObject(tenantId, fileName);

    // 🔹 Billing update
    await Usage.findOneAndUpdate(
      { tenantId, billingMonth: getCurrentMonth() },
      { $inc: { storageGB: -fileSizeGB, apiCalls: 1 } },
      { upsert: true }
    );

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== 🔗 PRESIGNED URL ==================
router.get("/presigned/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    await ensureBucket(tenantId);

  const url = await minioClient.presignedGetObject(
  tenantId,
  fileName,
  60 * 60
);

// 🔥 ONLY replace host (safe way)
const publicUrl = url.replace("http://minio:9000", "http://localhost:9000");

res.json({ url: publicUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;