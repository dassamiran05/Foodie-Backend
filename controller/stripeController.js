import Stripe from "stripe";
import zlib from "zlib";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModels from "../models/userModels.js";

const { STRIPE_SECRETKEY } = process.env;
const stripe = new Stripe(`${STRIPE_SECRETKEY}`);

// This is your Stripe CLI webhook secret for testing your endpoint locally.

//Update user role
const updateUserRole = async (userid) => {
  try {
    const user = await userModels.findByIdAndUpdate(
      userid,
      { role: 2 },
      {
        new: true,
        runValidators: true,
      }
    );
    await user.save();
  } catch (error) {
    console.log(error);
  }
};

//Update product
const updateProduct = async (data) => {
  console.log(data);

  try {
    data.map(async (item) => {
      const prod = await productModel.findById(item._id);
      let newquantity;
      if (prod && prod.quantity > item.cartQuantity) {
        newquantity = prod.quantity - item.cartQuantity;
      }

      const product = await productModel.findByIdAndUpdate(
        item._id,
        {
          sold: prod.sold ? prod.sold + item.cartQuantity : item.cartQuantity,
          quantity: newquantity,
        },
        { new: true, runValidators: true }
      );
      await product.save();
    });
  } catch (error) {
    console.log(error);
  }
};

//Create Order
const createHandleOrdr = async (customer, data) => {
  const items = JSON.parse(
    zlib.inflateSync(Buffer.from(customer.metadata.cart, "base64")).toString()
  );

  updateProduct(items);
  updateUserRole(customer.metadata.id);

  const newOrder = new orderModel({
    user: customer.metadata.id,
    customerId: data.customer,
    payment: {
      paymentIntentId: data.payment_intent,
      status: data.payment_status,
    },
    products: items,
    subtotal: data.amount_subtotal / 100,
    total: data.amount_total / 100,
  });

  try {
    await newOrder.save();
    // console.log("Order saved", saved);
  } catch (error) {
    console.log(error);
  }
};

let endpointSecret;
// endpointSecret =
//   "whsec_b1d588448f2f7fc9fc110be27c7c4371e75756721c567a639e7465592763c27e";

export const afterpaymentController = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let data;
  let eventType;

  if (endpointSecret) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Webhook verified");
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        // console.log(customer);
        // console.log("data", data);
        createHandleOrdr(customer, data);
      })
      .catch((err) => console.log(err));
  }

  res.send().end();
};
