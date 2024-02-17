import express from "express";
import {
  allUsersController,
  chnagePasswordController,
  loginController,
  // makeAdminController,
  registerController,
  reserveTableController,
  sendemailController,
  updateProfile,
} from "../controller/authController.js";
import { upload } from "../multer/Imageupload.js";
import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";
//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//Reserve table
router.post("/rtable", reserveTableController);

//Profile
router.patch(
  "/updateprofile",
  verifyToken,
  isAdmin,
  upload.single("profile"),
  updateProfile
);

//Get all users
router.get("/getallusers", verifyToken, isAdmin, allUsersController);

//Change password
router.patch("/changepassword", verifyToken, isAdmin, chnagePasswordController);

//Send Email
router.post("/sendemail", sendemailController);




export default router;
