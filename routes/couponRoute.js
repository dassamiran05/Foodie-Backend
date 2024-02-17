import express from "express";

import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";
import {
  createCouponController,
  deleteCouponController,
  getActivateCouponController,
  getAllCouponController,
  updateCouponController,
  verifyCouponController,
} from "../controller/couponController.js";
//router object
const router = express.Router();

//routing

//create coupon
router.post("/create-coupon", verifyToken, isAdmin, createCouponController);

//get all coupon
router.get("/getAllcoupon", verifyToken, isAdmin, getAllCouponController);

//get activate coupon
router.get("/getactivate", getActivateCouponController);

//get activate coupon
router.post("/verify", verifyToken, verifyCouponController);

//Update coupon
router.put(
  "/updatecoupon/:couponID",
  verifyToken,
  isAdmin,
  updateCouponController
);

//delete Coupon
router.delete(
  "/deletecoupon/:couponID",
  verifyToken,
  isAdmin,
  deleteCouponController
);

export default router;
