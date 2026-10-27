import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = {
  profilePhoto: ["image/jpeg", "image/png", "image/webp"],
  profilePicture: ["image/jpeg", "image/png", "image/webp"],
  logo: ["image/jpeg", "image/png", "image/webp"],
  file: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const fileFilter = (req, file, cb) => {
  const allowed =
    ALLOWED_MIME_TYPES[file.fieldname] || ALLOWED_MIME_TYPES.profilePhoto;

  if (!allowed.includes(file.mimetype)) {
    const error = new Error("Unsupported file type.");
    error.status = 400;
    return cb(error);
  }

  return cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 2 },
  fileFilter,
});

export default upload;
