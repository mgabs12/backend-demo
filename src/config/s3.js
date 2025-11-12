const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');

// Cliente S3 (usa credenciales de IAM automáticamente en EB)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'carbid-vehicle-images';

// Configurar multer para memoria (no disco)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Función para subir archivo a S3
async function uploadToS3(file) {
  const fileName = `vehicles/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // Hacer públicas las imágenes
    ACL: 'public-read'
  });

  try {
    await s3Client.send(command);
    // Retornar URL pública
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error subiendo a S3:', error);
    throw new Error('Error al subir imagen');
  }
}

// Función para eliminar archivo de S3
async function deleteFromS3(fileUrl) {
  try {
    // Extraer key del URL
    const urlParts = fileUrl.split('.com/');
    if (urlParts.length < 2) return;
    
    const key = urlParts[1];
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error eliminando de S3:', error);
  }
}

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  BUCKET_NAME
};