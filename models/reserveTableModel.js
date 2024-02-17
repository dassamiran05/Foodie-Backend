import mongoose from "mongoose";

const rtableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
      index: true,
      sparse: true,
    },
    nofGuest: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    time: {
      type: String,
      required: true,
    },
    tableToken: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("reserveTable", rtableSchema);
