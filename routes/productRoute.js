import express from "express";
import {
  createPaymentController,
  createProduct,
  deleteProduct,
  deleteReviewProduct,
  featuredProductsController,
  getProducts,
  reviewProduct,
  singleProduct,
  updateProduct,
  updateReview,
} from "../controller/productController.js";
import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";

import formidable from "express-formidable";
import { upload } from "../multer/Imageupload.js";
//router object
const router = express.Router();

//routing
//Create product
router.post(
  "/createproduct",
  verifyToken,
  isAdmin,
  upload.array("photo"),
  createProduct
);

//Get products
router.get("/getproducts", getProducts);

//Get Single product
router.get("/singleproduct/:id", singleProduct);

//Delete product
router.delete("/delproduct/:pid", verifyToken, isAdmin, deleteProduct);

//update product
router.patch(
  "/update/:pid",
  verifyToken,
  isAdmin,
  upload.array("photo"),
  updateProduct
);

//Product review
router.post("/review/:pid", verifyToken, reviewProduct);

//Delete Product review
router.patch("/deleteReview/:pid", verifyToken, deleteReviewProduct);

//Update Product review
router.patch("/updateReview/:id", verifyToken, updateReview);

//Get all featured  products
router.get("/featuredproducts", featuredProductsController);

//Make payments
router.post("/create-payment", verifyToken, createPaymentController);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   afterpaymentController
// );

export default router;
