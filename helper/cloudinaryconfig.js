import dotenv from "dotenv"
dotenv.config()
import { v2  } from "cloudinary";

v2.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});


export default v2
