// import couponModel from "../models/"

import moment from "moment";
import couponModel from "../models/couponModel.js";

export const createCouponController = async (req, res) => {
  try {
    const { name, expiry, discount } = req.body;

    if (new Date().getTime() > new Date(expiry).getTime()) {
      return res
        .status(401)
        .send({ message: "Expiry date should be in the future!!" });
    }

    // Validation;
    if (!name || !expiry || !discount) {
      return res.status(401).send({ message: "Please fill all the fields" });
    }

    const coupon = new couponModel({
      ...req.body,
      expiry: moment(req.body.expiry).format("YYYY-MM-DD"),
    });

    await coupon.save();
    res.status(201).send({
      success: true,
      message: "Coupon Created Successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing coupon",
    });
  }
};

export const getAllCouponController = async (req, res) => {
  try {
    // const coupons = await couponModel.find({});

    const docs = await couponModel.find().exec();
    const plainObjects = docs.map((doc) => doc.toObject());

    const couponSet = plainObjects.map((coupon) => {
      if (new Date(coupon.expiry).getTime() < new Date().getTime()) {
        return {
          ...coupon,
          expire: true,
        };
      } else {
        return coupon;
      }
    });
    console.log(couponSet);

    res.status(201).send({
      success: true,
      message: "All Coupon Successfully fetched",
      coupons: couponSet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting coupons",
    });
  }
};

export const getActivateCouponController = async (req, res) => {
  try {
    const { totalprice } = req.query;

    const coupons = await couponModel.find({});

    // let smallnumbersofgivennumber = [];
    // for (let i = 0; i < coupons.length; i++) {
    //   if (coupons[i].maxlimitprice <= Number(totalprice)) {
    //     smallnumbersofgivennumber = [...smallnumbersofgivennumber, coupons[i]];
    //   }
    // }

    let smallnumbersofgivennumber = [];
    smallnumbersofgivennumber = coupons.filter(
      (item) => item?.maxlimitprice <= Number(totalprice)
    );

    const getMaxValueholder = (arr) => {
      let itm = {};
      let max = arr[0].maxlimitprice;
      for (let i = 0; i < arr.length; i++) {
        if (max <= arr[i].maxlimitprice) {
          itm = arr[i];
        }
      }
      return itm;
    };

    const activeCoupon = getMaxValueholder(smallnumbersofgivennumber);

    if (new Date(activeCoupon.expiry).getTime() < new Date().getTime()) {
      return res
        .status(403)
        .send({ success: false, message: "Coupon Expired!!" });
    }

    res.status(201).send({
      success: true,
      // message: "All Coupon Successfully fetched",
      active: activeCoupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting coupons",
    });
  }
};

export const verifyCouponController = async (req, res) => {
  try {
    const { coupon, total } = req.body;

    if (coupon === "") {
      return res
        .status(403)
        .send({ success: false, message: "Coupon cant be empty!!" });
    }

    const coupons = await couponModel.find({});

    const cpn = coupons.find((item) => item.name === coupon);

    if (!cpn) {
      return res
        .status(403)
        .send({ success: false, message: "Invalid Coupon" });
    }

    console.log(new Date(cpn.expiry).getTime() < new Date().getTime());

    if (new Date(cpn.expiry).getTime() < new Date().getTime()) {
      return res
        .status(403)
        .send({ success: false, message: "Coupon Expired!!" });
    }

    const updatedTotal = total - (total * cpn.discount) / 100;

    res.status(201).send({
      success: true,
      message: "Coupon added successfully!!",
      totalprice: parseFloat(updatedTotal.toFixed(2)),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting coupons",
    });
  }
};

export const updateCouponController = async (req, res) => {
  try {
    const { name, expiry, discount } = req.body;

    const { couponID } = req.params;
    console.log(couponID);

    //Validation
    if (!name || !expiry || !discount) {
      return res.status(401).send({ message: "Please fill all the fields" });
    }

    const coupon = await couponModel.findById(couponID);

    if (!coupon) {
      return res.status(404).send({ message: "Invalid Coupon" });
    }

    const updatedCoupon = await couponModel.findByIdAndUpdate(
      couponID,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    await updatedCoupon.save();
    res.status(200).send({
      success: true,
      message: "Coupon Updated Successfully",
      updatedCoupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte coupon",
    });
  }
};

export const deleteCouponController = async (req, res) => {
  try {
    const { couponID } = req.params;
    const coupon = await couponModel.findById(couponID);
    // .populate("category");
    if (!coupon) {
      return res.status(404).send({ message: "Coupon does not exists" });
    }
    await couponModel.findByIdAndDelete(couponID);

    const remaining = await couponModel.find({});

    res.status(200).send({
      success: true,
      message: "Coupon Deleted successfully",
      remaining,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting coupon",
      error,
    });
  }
};
