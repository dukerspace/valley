export default () => ({
  database: process.env.DATABASE_URL,
  port: parseInt(process.env.PORT!, 10) || 3000,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME,
  fallback_language: process.env.FALLBACK_LANGUAGE || 'th',
  file_upload: process.env.FILE_UPLOAD,
  file_path: process.env.FILE_PATH
})
