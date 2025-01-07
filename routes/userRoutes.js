import express from "express";
import {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
} from "../controllers/userControllers.js";
import userAuth from "../middlewares/auth.js";
import generateImage from "../controllers/imageController.js";

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", userAuth, userCredits);
userRouter.post("/pay-razor", userAuth, paymentRazorpay);
userRouter.post("/verify-razor", verifyRazorpay);

export default userRouter;
//  http://localhost:4000/api/user/register
//  http://localhost:4000/api/user/login
