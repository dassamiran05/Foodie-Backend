import express from "express";


import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";
import { allOrdersController, getOrderStatusController } from "../controller/orderController.js";
import { allOrdersByFilterController } from "../controller/salesController.js";

const router = express.Router();

//Routes
// router.post("/create-category", verifyToken, isAdmin, createCategoryController);

// router.put(
//   "/update-category/:id",
//   verifyToken,
//   isAdmin,
//   updateCategoryController
// );

// Get all Category
router.get("/allorders",verifyToken , isAdmin, allOrdersController);

// Get all Category by filter
router.get("/getOrdersByFilters",verifyToken , isAdmin, allOrdersByFilterController);




// Get order status update
router.put("/statusupdate/:id",verifyToken , isAdmin, getOrderStatusController);

//Get Single Category
// router.get("/single-category/:id", singleCategoryController);

//Delete catgeory
// router.delete(
//   "/delete-category/:id",
//   verifyToken,
//   isAdmin,
//   deleteCategoryController
// );

export default router;
