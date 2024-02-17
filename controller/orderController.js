import slugify from "slugify";
import orderModel from "../models/orderModel.js";
import moment from "moment";

export const allOrdersController = async (req, res) => {
  try {


    // const perpage = 5;
    // const { page } = req.params;
    //   const page = parseInt(req.query.page);
    //   const limit = parseInt(req.query.limit);

    //   const pagepro = page ? page : 1;

    //   const datacount = await productModel.find({});

    //   const nPages = Math.ceil(datacount.length / limit);
    const orders = await orderModel
      .find({})
      .populate({
        path: "user",
        select:
          "-password -about -country -createdAt -phone -profile -role -updatedAt -__v -_id",
      })

      // .skip((pagepro - 1) * limit)
      // .limit(limit)
      .sort("-createdAt")
      .exec();

    const plainObjects = orders.map((order) => order.toObject());
    const updatedVersion = plainObjects.map((order) => {
      return {
        ...order,
        createdAt: moment(
          order.createdAt,
          moment.HTML5_FMT.DATETIME_LOCAL_MS
        ).format("YYYY-MM-DD"),
      };
    });


    if (orders.length === 0) {
      return res.status(403).send({
        success: false,
        message: "Currently there is no order in the database",
      });
    }
    res.status(200).send({
      success: true,
      message: "All Orders successfully fetched",
      orders: updatedVersion,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr in getting Orders",
      error: error.message,
    });
  }
};
export const getOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { delivery_status: value },
      { new: true, runValidators: true }
    );
    res.status(200).send({
      success: true,
      message: "Status successfully updated",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Erorr in getting Orders",
      error: error.message,
    });
  }
};
