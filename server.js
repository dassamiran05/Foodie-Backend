import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./db.js";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import couponRoute from "./routes/couponRoute.js";
import stripeRoute from "./routes/stripeRoute.js";
import orderRoute from "./routes/orderRoute.js";
import salesRoute from "./routes/salesRoute.js";
import cors from "cors";

const PORT = process.env.PORT || 8080;

dotenv.config();

//database config
connectDB();

const app = express();

//middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(morgan("dev"));
// app.use(bodyParser.urlencoded({ extended: true }));

//All Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/payment", stripeRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/sales", salesRoute);

app.get("/", (req, res) => {
  res.send({ message: "welcome to Redux Ecommerce Store" });
});

app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white
  );
});
