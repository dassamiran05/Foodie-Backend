// import express from "express";
// import router from new express.Router();

import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

// import cloudinary from require("../helper/cloudinaryconfig");
// import moment from "moment";

dotenv.config();

// img storage path
const imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadDir = "../uploads";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    callback(null, `image-${Date.now()}.${file.originalname}`);
  },
});

// img filter
const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("only images is allow"));
  }
};

export const upload = multer({
  storage: imgconfig,
  fileFilter: isImage,
});
