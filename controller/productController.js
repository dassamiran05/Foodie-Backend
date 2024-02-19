import slugify from "slugify";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import Stripe from "stripe";
import zlib from "zlib";
import moment from "moment";

import fs from "fs";
import v2 from "../helper/cloudinaryconfig.js";
import categoryModel from "../models/categoryModel.js";

export const createProduct = async (req, res) => {
  try {
    const { files } = req;
    const uploadPromises = files?.map((file) => v2.uploader.upload(file.path));
    const uploadRes = await Promise.all(uploadPromises);
    const {
      name,
      description,
      regularPrice,
      price,
      category,
      quantity,
      shipping,
      featured,
    } = req.body;

    console.log(req.body);

    // Validation;
    if (!name || !description || !category || !price || !quantity) {
      return res.status(401).send({ message: "Please fill all the fields" });
    }

    const products = new productModel({
      ...req.body,
      slug: slugify(name).toLowerCase(),
      photo: uploadRes.map((item) => item?.secure_url),
    });

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    // const perpage = 5;
    // const { page } = req.params;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const pagepro = page ? page : 1;

    const datacount = await productModel.find({});

    const nPages = Math.ceil(datacount.length / limit);
    const products = await productModel
      .find({})
      .populate("category")
      // .select("-photo -quantity")
      .skip((pagepro - 1) * limit)
      .limit(limit)
      .sort("-sold");
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "All products successfully fetched",
      count: datacount.length,
      numPage: nPages,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
export const getProductsControllerByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    // console.log(category);

    const categoryId = await categoryModel.findOne({ name: category });

    const products = await productModel.find({}).populate("category").exec();

    const categoryProducts = products.filter(
      (product) => product.category.name === categoryId.name
    );

    res.status(200).send({
      success: true,
      message: "All products successfully fetched by category",
      products: categoryProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
export const featuredProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select(
        " -description -sold -category -shipping -createdAt -updatedAt -__v -slug"
      );

    const featured = products.filter((product) => product.featured === "Y");
    res.status(200).send({
      success: true,
      message: "All featured products fetched",
      featured,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

export const singleProduct = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("category");
    if (!product) {
      return res.status(404).send({ message: "Product not found!!" });
    }
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid);
    // .populate("category");
    if (!product) {
      return res.status(404).send({ message: "Product not found!!" });
    }
    await productModel.findByIdAndDelete(req.params.pid);

    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
      deletedID: req.params.pid,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      regularPrice,
      price,
      category,
      quantity,
      shipping,
      featured,
    } = req.body;

    const { pid } = req.params;

    //Validation
    if (!name || !description || !category || !price || !quantity) {
      return res.status(401).send({ message: "Please fill all the fields" });
    }

    const product = await productModel.findById(pid);
    // .populate("category");
    if (!product) {
      return res.status(404).send({ message: "Product not found!!" });
    }
    let uploadRes;
    if (req.files.length > 0) {
      const { files } = req;
      const uploadPromises = files?.map((file) =>
        v2.uploader.upload(file.path)
      );
      uploadRes = await Promise.all(uploadPromises);
    }

    const products = await productModel.findByIdAndUpdate(
      pid,
      {
        ...req.body,
        slug: slugify(name).toLowerCase(),
        photo:
          uploadRes?.length > 0
            ? uploadRes.map((item) => item?.secure_url)
            : product.photo,
      },
      { new: true, runValidators: true }
    );

    await products.save();
    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte product",
    });
  }
};

export const createPaymentController = async (req, res) => {
  try {
    const { STRIPE_SECRETKEY } = process.env;
    const stripe = new Stripe(`${STRIPE_SECRETKEY}`);
    // console.log(req.body);
    const { buyerData, products, coupon } = req.body;
    const abc = zlib.deflateSync(JSON.stringify(products)).toString("base64");
    console.log(
      JSON.parse(zlib.inflateSync(Buffer.from(abc, "base64")).toString())
    );

    const {
      billing_name,
      billing_email,
      billing_country,
      billing_state,
      billing_city,
      Postal_Code,
      billing_phone,
      billing_address,
      order_comments,
    } = buyerData;

    const customer = await stripe.customers.create({
      name: billing_name,
      email: billing_email,
      phone: billing_phone,
      address: {
        line1: billing_address,
        country: billing_country,
        state: billing_state,
        city: billing_city,
        postal_code: Postal_Code,
      },
      description: order_comments ? order_comments : "",
      metadata: {
        id: req.user._id,
        cart: zlib.deflateSync(JSON.stringify(products)).toString("base64"),
      },
    });

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          images: product.photo,
          description: product.description,
          metadata: {
            id: product._id,
            price: product.price,
          },
        },
        unit_amount: product.price * 100 * 83.03,
      },
      quantity: product.cartQuantity,
    }));

    const sessionOptions = {
      line_items: lineItems,
      mode: "payment",
      customer: customer.id,
      success_url: `${process.env.LOCALDOMAIN}/payment/success`,
      cancel_url: `${process.env.LOCALDOMAIN}/cart`,
    };

    if (Object.keys(coupon).length > 0) {
      const discountCoupon = await stripe.coupons.create({
        percent_off: coupon?.discount,
        duration: "repeating",
        duration_in_months: 3,
        id: coupon?.name,
      });
      sessionOptions.discounts = [
        {
          coupon: discountCoupon.id,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    res.status(201).send({ id: session.id, paymentsuccess: true });

    // const products = new productModel({
    //   ...req.body,
    //   slug: slugify(name).toLowerCase(),
    //   photo: uploadRes.map((item) => item?.secure_url),
    // });

    // await products.save();
    // res.status(201).send({
    //   success: true,
    //   message: "Product Created Successfully",
    //   products,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Something wrong in making payment",
    });
  }
  // try {
  //   const stripe = new Stripe(
  //     "sk_test_51H4St6KHspfP33ih3tLIioEMYiS4pbvuUdPhho9INjNzvCnYfL0bPDJpnT0oy8tbgA3bSudWx7yjlK3dIkD5jY4Q00GLkC0DiR"
  //   );
  //   const { buyerData, products, paymentprice } = req.body;
  //   const paymentIntent = await stripe.paymentIntents.create({
  //     currency: "inr",
  //     amount: 100 * 100,
  //     description: "for Knighthunt payments",
  //     shipping: {
  //       name: "Ananda Gharami",
  //       address: {
  //         line1: "510 Townsend St",
  //         postal_code: "700006",
  //         postal_code: "700006",
  //         city: "San Francisco",
  //         state: "west bengal",
  //         country: "India",
  //       },
  //     },
  //   });

  //   res.status(200).send({
  //     clientSecret: paymentIntent.client_secret,
  //     // payment_intent: paymentIntent.id,
  //   });
  // } catch (error) {
  //   return next(error);
  // }
};

export const reviewProduct = async (req, res) => {
  try {
    const { rating, review, username, useremail, datewithtime } = req.body;

    const { pid } = req.params;

    if (rating < 1 || !review) {
      return res.status(404).send({ message: "Please add rating and review" });
    }

    const product = await productModel.findById(pid);
    // .populate("category");
    if (!product) {
      return res.status(404).send({ message: "Product not found!!" });
    }

    product.rating = [
      ...product.rating,
      {
        ...req.body,
        userId: req.user?._id,
        datewithtime: moment(
          datewithtime,
          moment.HTML5_FMT.DATETIME_LOCAL_MS
        ).format("YYYY-MM-DD"),
      },
    ];

    product.save();
    res.status(200).send({
      message: `Review successfully submitted for ${product?.name}`,
      success: true,
      rating: product?.rating,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Something wrong while adding review",
    });
  }
};
export const deleteReviewProduct = async (req, res) => {
  const { userID } = req.body;

  const { pid } = req.params;

  const product = await productModel.findById(pid);
  // .populate("category");
  if (!product) {
    return res.status(404).send({ message: "Product not found!!" });
  }

  const newRatings = product.rating.filter((rat) => {
    return rat.userID?.toString() !== userID?.toString();
  });
  product.rating = newRatings;
  product.save();

  res
    .status(200)
    .send({ message: `Review deleted successfully for ${product.name}` });
};

export const updateReview = async (req, res) => {
  const { rating, review, reviewDate, userID } = req.body;

  const { id } = req.params;

  if (rating < 1 || !review) {
    return res.status(404).send({ message: "Please add rating and review" });
  }

  const product = await productModel.findById(id);
  // .populate("category");
  if (!product) {
    return res.status(404).send({ message: "Product not found!!" });
  }

  if (req.user._id.toString() !== userID.toString()) {
    return res.status(404).send({ message: "User not Authorized" });
  }
  const updateReview = await productModel.findByIdAndUpdate(
    {
      _id: product._id,
      "rating.userID": mongoose.Types.ObjectId(userID),
    },
    {
      $set: {
        "rating.$.rating": rating,
        "rating.$.review": review,
        "rating.$.reviewDate": reviewDate,
      },
    }
  );

  if (updateReview) {
    res.status(200).send({ message: `Review updated successfully ` });
  } else {
    res.status(200).send({ message: `Something wrong while updating Review` });
  }
};
