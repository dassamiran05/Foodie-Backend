import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    customerId: { type: String },
    products: [
      {
        // type: mongoose.ObjectId,
        // ref: "Products",
        id: { type: String },
        name: { type: String },
        regularPrice: { type: Number },
        price: { type: Number },
        quantity: { type: Number },
        rating: { type: Array },
        featured: { type: String },
        cartQuantity: { type: Number },
      },
    ],
    payment: {
      type: Object,
      required: true,
    },
    // buyer: {
    //   type: mongoose.ObjectId,
    //   ref: "users",
    // },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    delivery_status: {
      type: String,
      default: "Pending",
      enum: [
        "Not Process",
        "Processing",
        "Shipped",
        "deliverd",
        "cancel",
        "Pending",
      ],
    },
    // payment_status: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Orders", orderSchema);
