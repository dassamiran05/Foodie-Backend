import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Add a product name"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Add a description"],
      trim: true,
    },
    sold: {
      type: Number,
      default: 0,
      trim: true,
    },
    regularPrice: {
      type: Number,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Add a price"],
      trim: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: [true, "Add a category"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    photo: {
      // data: Buffer,
      // contentType: String,
      type: Array,
    },
    shipping: {
      type: String,
    },
    rating: {
      type: [Object],
    },
    featured: {
      type: String,
      default: "N",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
