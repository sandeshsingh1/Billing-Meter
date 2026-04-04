const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: 'minio',   // ✅ always this
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'password123'
});

async function ensureBucket(bucketName) {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName);
    }
}

module.exports = { minioClient, ensureBucket };