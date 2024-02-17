import express from "express";

import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controller/categoryController.js";
import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";

const router = express.Router();

//Routes
router.post("/create-category", verifyToken, isAdmin, createCategoryController);

router.put(
  "/update-category/:id",
  verifyToken,
  isAdmin,
  updateCategoryController
);

// Get all Category
router.get("/allcategories", categoryController);

//Get Single Category
router.get("/single-category/:id", singleCategoryController);

//Delete catgeory
router.delete(
  "/delete-category/:id",
  verifyToken,
  isAdmin,
  deleteCategoryController
);

export default router;
