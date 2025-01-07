import userModel from "../models/userModel.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HF_API_URL = process.env.HUGGING_FACE_URL;
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.creditBalance <= 0) {
      return res.status(403).json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    // API call to Hugging Face
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        responseType: "arraybuffer", // Get raw binary data
      }
    );

    const imageData = response.data;

    // Convert to Base64
    const base64Image = Buffer.from(imageData, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // Optionally save the image locally
    // const outputPath = path.join(
    //   __dirname,
    //   "../generated_images",
    //   `${prompt.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
    // );
    // fs.writeFileSync(imageData);

    // Deduct one credit
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    // Respond with both the image URL and base64 string
    res.json({
      success: true,
      message: "Image generated successfully",
      creditBalance: user.creditBalance - 1,
      resultImage,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export default generateImage;
