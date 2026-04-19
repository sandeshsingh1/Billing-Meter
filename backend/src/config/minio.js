const Minio = require("minio");

const endPoint = process.env.S3_ENDPOINT || "127.0.0.1";
const port = process.env.S3_PORT ? Number(process.env.S3_PORT) : 9000;
const useSSL = process.env.S3_USE_SSL === "true";
const accessKey = process.env.S3_ACCESS_KEY || "admin";
const secretKey = process.env.S3_SECRET_KEY || "password123";
const region = process.env.S3_REGION || "us-east-1";
const pathStyle = process.env.S3_PATH_STYLE !== "false";

const minioClient = new Minio.Client({
  endPoint,
  port,
  useSSL,
  accessKey,
  secretKey,
  region,
  pathStyle,
});

async function ensureBucket(bucketName) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, region);
  }
}

module.exports = { minioClient, ensureBucket };
