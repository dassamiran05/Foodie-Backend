import JWT from "jsonwebtoken";
import userModel from "../models/userModels.js";

//Protected routes token based
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({ message: "Not authorised, please login" });
    }
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

//admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    // console.log(user);
    if (user?.role !== 1) {
      res.status(401).send({
        success: false,
        message: "Unauthorized access",
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(401).send({
      success: true,
      messgae: "Error in admin middleware",
      error,
    });
  }
};
