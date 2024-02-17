import orderModel from "../models/orderModel.js";

export const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  console.log(today, startOfDay, endOfDay);
  return { startDate: startOfDay, endDate: endOfDay };
};

// Function to get start and end dates for this month
export const getThisMonthRange = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return { startDate: startOfMonth, endDate: endOfMonth };
};

// Function to get start and end dates for this year
export const getThisYearRange = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  endOfYear.setHours(23, 59, 59, 999);
  return { startDate: startOfYear, endDate: endOfYear };
};

export const getSalesData = async (dateRange) => {
  try {
    const { startDate, endDate } = dateRange;
    const salesData = await orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return salesData;
  } catch (error) {
    throw error;
  }
};
