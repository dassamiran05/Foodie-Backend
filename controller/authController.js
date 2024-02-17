import userModel from "../models/userModels.js";
import { comparePassword, hashPassword } from "../helper/authHelper.js";
import JWT from "jsonwebtoken";
// import userModels from "../models/userModels.js";
import bcrypt from "bcrypt";
import reserveTableModel from "../models/reserveTableModel.js";
import moment from "moment"; // require
import { v2 } from "cloudinary";
import nodemailer from "nodemailer";

//Registrater controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validations
    if (!name) {
      return res.send({
        message: "Name is Required",
      });
    }
    if (!email) {
      return res.send({
        message: "Email is Required",
      });
    }
    if (!password) {
      return res.send({
        message: "Password is Required",
      });
    }

    //check user
    const existingUser = await userModel.findOne({
      email,
    });

    //check existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered please login",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
    }).save();
    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//Login post
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validations
    if (!email || !password) {
      return res.send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not registered",
      });
    }

    const match = await comparePassword(password, user?.password);

    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    let userfinal = {
      userID: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
    };

    const { phone, about, country, profile } = user;
    if (phone || about || country || profile) {
      userfinal = {
        ...userfinal,
        phone: phone,
        about: about,
        country: country,
        profile: profile,
      };
    }

    //Token Generation

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: userfinal,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

//Chnage password
export const chnagePasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    //Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.send({
        success: false,
        message: "Every field must be filled!!",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        success: false,
        message: "Password must be matched before change",
      });
    }

    const user = await userModel.findById({ _id: req.user._id });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not found",
      });
    }

    const match = await comparePassword(currentPassword, user?.password);
    console.log(match);

    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    const newHashpassword = await hashPassword(newPassword);
    console.log(newHashpassword);

    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        password: newHashpassword,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

//Reserve table
export const reserveTableController = async (req, res) => {
  try {
    const { name, email, nofGuest, date, time } = req.body;

    const senderror = (status, errmsg) => {
      return res.status(status).send({
        message: errmsg,
      });
    };

    //Validations
    if (!name) {
      senderror(401, "Name is Required");
    }
    if (!email) {
      senderror(401, "Email is Required");
    }
    if (!nofGuest) {
      senderror(401, "No of Guest ?");
    }
    if (!date) {
      senderror(401, "Date should not be empty");
    }
    if (!time) {
      senderror(401, "Time should not be empty");
    }
    if (nofGuest > 5) {
      senderror(401, "Only 5 member at a time");
    }

    const currentdate = new Date();
    const selectedDate = new Date(date);

    if (selectedDate.getTime() < currentdate.getTime()) {
      return res.status(404).send({
        success: false,
        message: "Booking date must be in future",
      });
    }

    const existsUser = await reserveTableModel.findOne({ email });

    if (existsUser) {
      const isbookedfortoday = await reserveTableModel.findOne({ date });
      if (isbookedfortoday) {
        return res.status(404).send({
          success: false,
          message: "This email has already booked a table today",
        });
      }
    }

    // const isoccupied = await reserveTableModel.findOne({ date, time });

    // if (isoccupied) {
    //   return res.status(404).send({
    //     success: false,
    //     message: "Already Reserved",
    //   });
    // }

    const tabletoken = Math.floor(Math.random() * 10) + 1;

    const tableData = await new reserveTableModel({
      name,
      email,
      nofGuest,
      date,
      time,
      tableToken: tabletoken,
    }).save();

    return res.status(200).send({
      success: true,
      message: "Reserved successfully done",
      token: tabletoken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Reservation a table",
      error,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, about, phone, email, country } = req.body;
    const { file } = req;

    const upload = await v2.uploader.upload(file.path);

    console.log(req.body, file, upload);
    //validations
    if (!name) {
      return res.send({
        message: "Name is Required",
      });
    }

    if (!phone) {
      return res.send({
        message: "Phone is Required",
      });
    }
    if (!country) {
      return res.send({
        message: "Phone is Required",
      });
    }

    //check user
    const existingUser = await userModel.findOne({
      _id: req.user._id,
    });

    // check existing user
    if (!existingUser) {
      return res.status(200).send({
        success: false,
        message: "User does not exists",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name,
          country: country,
          phone: phone,
          about: about,
          profile: upload.secure_url,
        },
      },
      {
        new: true,
        runValidators: true,
        select: "-password -createdAt -updatedAt",
      }
    );

    res.status(201).send({
      success: true,
      message: "User profile updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating profile",
      error,
    });
  }
};

export const allUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({
        $or: [{ role: { $ne: 1 } }],
      })
      .select("-password -updatedAt -__v")
      .sort({ createdAt: "-1" });

    const handleUser = (user) => {
      // console.log(Object.values(user.toJSON()));

      const myNewObject = Object.entries(user.toJSON()).reduce(
        (obj, [key, value]) => {
          value !== "" || null ? (obj[key] = user[key]) : null;
          return obj;
        },
        {}
      );
      myNewObject.createdAt = moment(
        user.createdAt,
        moment.HTML5_FMT.DATETIME_LOCAL_MS
      ).format("YYYY-MM-DD");
      return myNewObject;
    };

    const allusers = users.map((user) => handleUser(user));

    res.status(201).send({
      success: true,
      message: "All users successfully fetched",
      users: allusers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Users",
      error,
    });
  }
};

export const sendemailController = async (req, res) => {
  const { complete_name, email_address, phone, message } = req.body;

  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email_address,
      subject: "subject",
      text: `<h1>adadsddsdsd</h1>`,
      html: "<h1>Thank you for your message.Shortly we will get back to you!</h1>",
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Email sent", info);
        res
          .status(201)
          .send({
            status: 201,
            info,
            message: "Email has been sent to your mail",
          });
      }
    });
  } catch (error) {
    res.status(201).send({ status: 401, error });
  }
};
// export const makeAdminController = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const user = await userModel.findOne({
//       email,
//     });

//     console.log(user);

//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.role === 0) {
//       const userres = await userModel.findByIdAndUpdate(
//         email,
//         {
//           $set: {
//             role: 1,
//           },
//         },
//         {
//           new: true,
//           runValidators: true,
//           // select: "-password -createdAt -updatedAt",
//         }
//       );
//       console.log(userres);
//     }

//     res.status(201).send({
//       success: true,
//       message: "Successfully made admin",
//       // users: allusers,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: "Error WHile making admin",
//       error,
//     });
//   }
// };
