import slugify from "slugify";
import orderModel from "../models/orderModel.js";
import moment from "moment";
import userModels from "../models/userModels.js";

export const allOrdersController = async (req, res) => {
  try {
    const { limit, page, search } = req.query;
    console.log(req.query);

    const limit2 = Number(limit);
    const pageNo = Number(page);

    // const pagepro = page ? page : 1;

    // const datacount = await orderModel.find({});
    // const nPages = Math.ceil(datacount.length / limit2);

    let searchQuery = {};
    if (search) {
      const user = await userModels.findOne({ name: search });
      searchQuery = {
        $or: [
          { user: user?._id },
          { "products.name": { $regex: search, $options: "i" } },
        ],
      };
    }
    const count = await orderModel.countDocuments(searchQuery);
    const orders = await orderModel
      .find(searchQuery)
      .populate({
        path: "user",
        select:
          "-password -about -country -createdAt -phone -profile -role -updatedAt -__v -_id",
      })

      .skip((pageNo - 1) * limit2)
      .limit(limit2)
      .sort("-createdAt")
      .exec();
    const pageCount = Math.ceil(count / limit2);

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

    // if (orders.length === 0) {
    //   return res.status(403).send({
    //     success: false,
    //     message: "Currently there is no order in the database",
    //   });
    // }
    res.status(200).send({
      success: true,
      message: "All Orders successfully fetched",
      orders: updatedVersion,
      // pagecount: nPages,
      pagination: {
        count,
        pageCount,
      },
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
