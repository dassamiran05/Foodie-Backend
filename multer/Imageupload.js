// import express from "express";
// import router from new express.Router();

import dotenv from "dotenv";
import multer from "multer";

// import cloudinary from require("../helper/cloudinaryconfig");
// import moment from "moment";

dotenv.config();

// img storage path
const imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "../backend/uploads");
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

// user register
// router.post("/register", upload.single("photo"), async (req, res) => {
//   const upload = await cloudinary.uploader.upload(req.file.path);
//   console.log(upload);

//   const { name } = req.body;

//   try {
//     const date = moment(new Date()).format("YYYY-MM-DD");

//     const userdata = new users({
//       name: name,
//       imgPath: upload.secure_url,
//       date: date,
//     });
//     console.log(userdata);

//     await userdata.save();
//     res.status(200).send({ message: "Data added successfull", userdata });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// user data get
// router.get("/getdata", async (req, res) => {
//   try {
//     const getUser = await users.find();
//     res.status(200).send(getUser);
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });
// router.delete("/deletedata/:id", async (req, res) => {
//   try {
//     await users.findByIdAndDelete(req.params.id);
//     res.status(200).send({
//       success: true,
//       message: "Deleted successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }
// });

// module.exports = router;
