const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const Usage = require("../models/Usage");
const { minioClient, ensureBucket } = require("../config/minio");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const tenantId = req.user.tenantId;
    const fileName = `${Date.now()}-${file.originalname}`;

    await ensureBucket(tenantId);
    await minioClient.putObject(tenantId, fileName, file.buffer);

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

router.get("/", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const files = [];

    const stream = minioClient.listObjects(tenantId, "", true);

    stream.on("data", (obj) => files.push(obj.name));
    stream.on("end", () => res.json(files));
    stream.on("error", (err) => res.status(500).json({ error: err.message }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/download/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    const stream = await minioClient.getObject(tenantId, fileName);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    const stat = await minioClient.statObject(tenantId, fileName);
    const fileSizeGB = stat.size / (1024 * 1024 * 1024);

    await minioClient.removeObject(tenantId, fileName);

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

router.get("/presigned/:fileName", protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fileName } = req.params;

    await ensureBucket(tenantId);

    const url = await minioClient.presignedGetObject(tenantId, fileName, 60 * 60);

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
