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
import {
  allSoldProductsController,
  getCustomerController,
  getRevenueController,
  getSalesController,
} from "../controller/salesController.js";
//router object
const router = express.Router();

//routing
router.get("/revenuedata", verifyToken, isAdmin, getRevenueController);

router.get("/salesdata", verifyToken, isAdmin, getSalesController);

router.get("/customerdata", verifyToken, isAdmin, getCustomerController);

// Get all Sold products
router.get("/getAllSoldproducts",verifyToken , isAdmin, allSoldProductsController);

export default router;
