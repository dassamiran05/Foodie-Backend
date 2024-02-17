import {
  getSalesData,
  getThisMonthRange,
  getThisYearRange,
  getTodayRange,
} from "../helper/salesHelper.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModels from "../models/userModels.js";

const getDateRange = (period) => {
  let dateRange = "";
  switch (period) {
    case "Today":
      dateRange = getTodayRange();
      break;
    case "This Month":
      dateRange = getThisMonthRange();
      break;
    case "This Year":
      dateRange = getThisYearRange();
      break;

    default:
      throw new Error("Invalid date");
  }

  return dateRange;
};

export const getRevenueController = async (req, res) => {
  try {
    const { tag } = req.query;

    console.log("Today", new Date().toISOString().split("T")[0]);
    console.log("This month", new Date().getMonth() + 1);
    console.log("This year", new Date().getFullYear());

    const getDatabydate = async (period) => {
      let range = getDateRange(period);

      try {
        const revenueData = await getSalesData(range);
        // console.log(`Sales data for ${period}:`, salesData);
        const total = revenueData.reduce((acc, curr) => acc + curr.total, 0);
        console.log((total / 83.03).toFixed(2));
        res.status(200).send({
          success: true,
          message: `Revenue ${total} for ${period}`,
          total: parseFloat((total / 83.03).toFixed(2)),
        });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    getDatabydate(tag);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting data!!",
      error,
    });
  }
};

export const getSalesController = async (req, res) => {
  try {
    const { tag } = req.query;

    const getDatabydate = async (period) => {
      let range = getDateRange(period);

      try {
        const salesdata = await getSalesData(range);

        const allproducts = salesdata.flatMap((product) => {
          return product.products;
        });

        const total = allproducts.reduce(
          (sum, item) => sum + item?.cartQuantity,
          0
        );

        res.status(200).send({
          success: true,
          message: `Sale ${total} for ${period}`,
          total,
        });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    getDatabydate(tag);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting data!!",
      error,
    });
  }
};
export const getCustomerController = async (req, res) => {
  try {
    const { tag } = req.query;

    const getDatabydate = async (period) => {
      let range = getDateRange(period);

      try {
        const salesdata = await getSalesData(range);

        const users = salesdata.map((item) => {
          return item.user.toString();
        });

        let uniqueusers = [];
        users.map((user) => {
          if (!uniqueusers.includes(user)) {
            uniqueusers.push(user);
          }
        });

        res.status(200).send({
          success: true,
          message: `${uniqueusers?.length} users for ${period}`,
          total: uniqueusers?.length,
        });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    getDatabydate(tag);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting data!!",
      error,
    });
  }
};
export const allOrdersByFilterController = async (req, res) => {
  try {
    const { limit, period, search } = req.query;
    // console.log(limit, period, search);

    let range = getDateRange(period);

    const { startDate, endDate } = range;

    const totalCount = await orderModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const user = await userModels.findOne({ name: search });

    const ordersData = await orderModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
        $or: [
          { user: user?._id },
          { "products.name": { $regex: search, $options: "i" } },
        ],
      })
      .populate({
        path: "user",
        select:
          "-password -about -country -createdAt -phone -profile -role -updatedAt -__v -_id",
      })
      .limit(limit)
      .sort("-createdAt");

    res.status(200).send({
      success: true,
      message: `All orders fetched by filter`,
      orders: ordersData,
      total: totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting data!!",
      error,
    });
  }
};
export const allSoldProductsController = async (req, res) => {
  try {
    const { tag } = req.query;

    let range = getDateRange(tag);

    const { startDate, endDate } = range;
    console.log(tag, range);

    const ordersData = await orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const products = ordersData
      .flatMap((order) => order.products)
      .map((product) => {
        return {
          cartQuantity: product.cartQuantity,
          id: product._id.toString(),
        };
      });

    const resPro = [];
    products.map((item) => {
      const existsIndex = resPro.findIndex((pro) => pro.id === item.id);
      if (existsIndex !== -1) {
        resPro[existsIndex].cartQuantity += item.cartQuantity;
      } else {
        resPro.push(item);
      }
    });
    // console.log(res);

    const soldProducts = await productModel
      .find({ _id: { $in: resPro.map((item) => item.id) } })
      .exec();

    const resProducts = soldProducts.map((product) => {
      const existsIndex = resPro.findIndex((pro) => pro.id === product.id);
      if (existsIndex !== -1) {
        return {
          preview: product.photo,
          productName: product.name,
          price: product.price,
          sold: resPro[existsIndex].cartQuantity,
          revenue: product.price * resPro[existsIndex].cartQuantity,
        };
      }
    });

    const finalPros = resProducts.sort((a, b) => b.sold - a.sold);

    res.status(200).send({
      success: true,
      message: `All sold products fetched`,
      soldproducts: finalPros,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting data!!",
      error,
    });
  }
};
