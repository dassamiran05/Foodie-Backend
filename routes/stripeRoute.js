import express from "express";
import { afterpaymentController } from "../controller/stripeController.js";

// import { isAdmin, verifyToken } from "../middelwares/authMiddleware.js";

//router object
const router = express.Router();



//Make payments
// router.post("/create-payment", verifyToken, createPaymentController);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  afterpaymentController
);

export default router;
