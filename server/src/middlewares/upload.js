import multer from "multer";

// Use memory storage - files will be stored in memory as Buffer
// Then uploaded to Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
